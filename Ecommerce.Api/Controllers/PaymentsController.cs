using System.Text;
using Ecom.Api.Domain.Entities;
using Ecom.Api.Dtos;
using Ecom.Api.Infrastructure;
using Ecom.Api.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ecom.Api.Controllers
{
    [ApiController]
    [Route("api/v1/payments")]
    public class PaymentsController(AppDbContext db, IPaymentProvider provider, ILogger<PaymentsController> logger) : ControllerBase
    {
        Guid RequireUserId() =>
            Guid.TryParse(User.FindFirstValue("sub") ?? User.FindFirstValue("user_id"), out var id)
                ? id : throw new UnauthorizedAccessException();

        /// <summary>
        /// Tạo phiên thanh toán cho đơn hàng (Stripe Checkout).
        /// </summary>
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreatePaymentRequest req, CancellationToken ct)
        {
            var uid = RequireUserId();

            var order = await db.Orders.FindAsync(new object?[] { req.OrderId }, ct);
            if (order is null) return NotFound("Order not found");
            if (order.UserId != uid) return Forbid();
            if (!string.Equals(order.Status, "pending", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Order is not pending");

            // VND zero-decimal → đồng
            long amount = Convert.ToInt64(decimal.Truncate(order.TotalAmount));

            // Stripe minimum: 50 cents USD ≈ ₫12,500 (tỷ giá ~25,000 VND/USD)
            // Để an toàn, yêu cầu tối thiểu ₫15,000
            const long MinimumAmountVND = 15_000;
            if (amount < MinimumAmountVND)
            {
                return BadRequest($"Order amount must be at least ₫{MinimumAmountVND:N0} (Stripe requires minimum ~$0.50 USD). Current: ₫{amount:N0}");
            }

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                Provider = (req.Provider ?? "stripe").ToLowerInvariant(),
                Amount = amount,
                Currency = "VND",
                Status = "pending"
            };

            // GỌI STRIPE TRƯỚC (chưa lưu DB)
            var (checkoutUrl, providerPaymentId) = await provider.CreateCheckoutAsync(payment, order, ct);

            // Gán các trường phụ thuộc provider
            payment.ProviderPaymentId = providerPaymentId;
            payment.CheckoutUrl = checkoutUrl;

            // LÚC NÀY MỚI LƯU (đã có ProviderPaymentId ⇒ không vi phạm NOT NULL)
            db.Payments.Add(payment);
            await db.SaveChangesAsync(ct);

            logger.LogInformation("Created payment {PaymentId} for order {OrderId} via {Provider}", payment.Id, order.Id, payment.Provider);

            return Ok(new CreatePaymentResponse(payment.Id, checkoutUrl));
        }

        /// <summary>
        /// Webhook Stripe. Verify signature bên trong provider. Luôn trả 2xx nếu đã xử lý/ghi log để Stripe không retry vô tận.
        /// </summary>
        [AllowAnonymous]
        [HttpPost("webhook")]
        [HttpPost("/api/webhook")] // Route thứ 2 để Stripe có thể gọi trực tiếp
        public async Task<IActionResult> Webhook(CancellationToken ct)
        {
            logger.LogInformation("=== WEBHOOK RECEIVED ===");
            
            using var reader = new StreamReader(Request.Body, Encoding.UTF8);
            var raw = await reader.ReadToEndAsync();

            logger.LogInformation("Webhook payload length: {Length} bytes", raw.Length);

            if (!provider.TryParseWebhook(Request, raw, out var evt))
            {
                logger.LogWarning("❌ Stripe webhook signature verification FAILED");
                return Unauthorized();
            }

            logger.LogInformation("✅ Webhook signature verified. Event ID: {EventId}, Type: {EventType}, ProviderPaymentId: {PPID}", 
                evt.Id, evt.Type, evt.ProviderPaymentId);

            // Idempotency: nếu event đã có thì no-op
            var existed = await db.PaymentEvents.AnyAsync(x => x.ProviderEventId == evt.Id, ct);
            if (existed)
            {
                logger.LogInformation("⚠️ Event {EventId} already processed (idempotency check), skipping", evt.Id);
                return Ok();
            }

            // Tìm payment bằng ProviderPaymentId (Stripe session id hoặc payment_intent id)
            var payment = await db.Payments.FirstOrDefaultAsync(p => p.ProviderPaymentId == evt.ProviderPaymentId, ct);

            logger.LogInformation("Payment lookup: {Found}, PaymentId: {PaymentId}", 
                payment != null ? "FOUND" : "NOT FOUND", 
                payment?.Id.ToString() ?? "N/A");

            // Lưu event trước (kể cả khi chưa map được payment để giữ dấu vết)
            db.PaymentEvents.Add(new PaymentEvent
            {
                Id = Guid.NewGuid(),
                PaymentId = payment?.Id ?? Guid.Empty,
                ProviderEventId = evt.Id,
                Type = evt.Type,
                Raw = evt.RawJson
            });

            if (payment is null)
            {
                await db.SaveChangesAsync(ct);
                logger.LogWarning("❌ Webhook {EventId} type {Type} not mapped to any payment (providerPaymentId: {PPID})",
                    evt.Id, evt.Type, evt.ProviderPaymentId);
                return Ok();
            }

            var order = await db.Orders.FindAsync(new object?[] { payment.OrderId }, ct);
            if (order is null)
            {
                await db.SaveChangesAsync(ct);
                logger.LogWarning("❌ Payment {PaymentId} has no related order {OrderId}", payment.Id, payment.OrderId);
                return Ok();
            }

            logger.LogInformation("Order found: {OrderId}, Current status: {CurrentStatus}, UserId: {UserId}", 
                order.Id, order.Status, order.UserId);

            // Đối soát số tiền nếu provider gửi (Stripe có thể gửi 0 ở vài event → bỏ qua check)
            if (evt.Amount > 0 && evt.Amount != payment.Amount)
            {
                logger.LogWarning("❌ Amount mismatch for payment {PaymentId}: evt={EvtAmount} vs db={DbAmount}", 
                    payment.Id, evt.Amount, payment.Amount);
                await db.SaveChangesAsync(ct);
                return Ok();
            }

            var oldPaymentStatus = payment.Status;
            var oldOrderStatus = order.Status;

            // Map trạng thái theo type
            if (string.Equals(evt.Type, "checkout.session.completed", StringComparison.OrdinalIgnoreCase)
                || string.Equals(evt.Type, "payment_intent.succeeded", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogInformation("🎯 Event type matched SUCCESS: {EventType}", evt.Type);
                payment.Status = "paid";
                order.Status = "paid";
                logger.LogInformation("📝 Setting payment status: {OldStatus} → {NewStatus}", oldPaymentStatus, payment.Status);
                logger.LogInformation("📝 Setting order status: {OldStatus} → {NewStatus}", oldOrderStatus, order.Status);
            }
            else if (string.Equals(evt.Type, "payment_intent.payment_failed", StringComparison.OrdinalIgnoreCase))
            {
                logger.LogInformation("⚠️ Event type matched FAILED: {EventType}", evt.Type);
                payment.Status = "failed";
                logger.LogInformation("📝 Setting payment status: {OldStatus} → {NewStatus}", oldPaymentStatus, payment.Status);
                // order: tuỳ policy, có thể giữ pending để cho phép thanh toán lại
            }
            else
            {
                logger.LogInformation("ℹ️ Event type NOT matched for status update: {EventType}", evt.Type);
            }

            payment.UpdatedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            logger.LogInformation("💾 Saving changes to database...");
            var saveResult = await db.SaveChangesAsync(ct);
            logger.LogInformation("✅ Database saved. {RowsAffected} rows affected", saveResult);
            
            logger.LogInformation("🎉 WEBHOOK PROCESSING COMPLETE. Order {OrderId} final status: {OrderStatus}, Payment {PaymentId} final status: {PaymentStatus}", 
                order.Id, order.Status, payment.Id, payment.Status);
            
            return Ok();
        }

        /// <summary>
        /// Lấy thông tin payment theo Id (chỉ chủ đơn xem được).
        /// </summary>
        [Authorize]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        {
            var uid = RequireUserId();

            var p = await db.Payments.FindAsync(new object?[] { id }, ct);
            if (p is null) return NotFound();

            var order = await db.Orders.FindAsync(new object?[] { p.OrderId }, ct);
            if (order is null || order.UserId != uid) return Forbid();

            return Ok(p);
        }
    }
}
