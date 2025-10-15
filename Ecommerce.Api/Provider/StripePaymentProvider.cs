using Stripe;
using Stripe.Checkout;
using Microsoft.Extensions.Logging;

using Ecom.Api.Domain.Entities;
using Ecom.Api.Dtos;
using Ecom.Api.Interface;

namespace Ecom.Api.Provider
{
    public sealed class StripePaymentProvider : IPaymentProvider
    {
        private readonly string _secretKey;
        private readonly string _webhookSecret;
        private readonly string _successUrl;
        private readonly string _cancelUrl;
        private readonly ILogger<StripePaymentProvider> _logger;

        // Event type literals (tránh phụ thuộc vào Stripe.Events.*)
        private const string EVT_CHECKOUT_COMPLETED = "checkout.session.completed";
        private const string EVT_PI_SUCCEEDED = "payment_intent.succeeded";
        private const string EVT_PI_FAILED = "payment_intent.payment_failed";

        public StripePaymentProvider(IConfiguration config, ILogger<StripePaymentProvider> logger)
        {
            _secretKey = config["Stripe:SecretKey"] ?? throw new InvalidOperationException("Stripe:SecretKey missing");
            _webhookSecret = config["Stripe:WebhookSecret"] ?? throw new InvalidOperationException("Stripe:WebhookSecret missing");
            _successUrl = config["Stripe:SuccessUrl"] ?? throw new InvalidOperationException("Stripe:SuccessUrl missing");
            _cancelUrl = config["Stripe:CancelUrl"] ?? throw new InvalidOperationException("Stripe:CancelUrl missing");
            _logger = logger;

            StripeConfiguration.ApiKey = _secretKey;
        }

        public async Task<(string checkoutUrl, string providerPaymentId)> CreateCheckoutAsync(
            Payment payment, Order order, CancellationToken ct)
        {
            // VND zero-decimal → amount (đồng)
            long amount = payment.Amount;

            var sessionOptions = new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = _successUrl,
                CancelUrl = _cancelUrl,
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new()
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "vnd",
                            UnitAmount = amount,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"ORDER #{order.Id:N}",
                                Images = order.Products?.FirstOrDefault()?.ImageUrl is string u && !string.IsNullOrWhiteSpace(u)
                                    ? new List<string> { u }
                                    : null
                            }
                        }
                    }
                },
                Metadata = new Dictionary<string, string>
                {
                    ["paymentId"] = payment.Id.ToString(),
                    ["orderId"] = order.Id.ToString(),
                    ["userId"] = order.UserId.ToString()
                }
            };

            var service = new SessionService();
            var reqOpts = new RequestOptions { IdempotencyKey = $"pay_{payment.Id:N}" };

            var session = await service.CreateAsync(sessionOptions, reqOpts, ct);
            return (session.Url, session.Id);
        }

        public bool TryParseWebhook(HttpRequest request, string rawBody, out ProviderWebhookEvent evt)
        {
            evt = default!;
            try
            {
                _logger.LogInformation("🔍 [StripeProvider] Parsing webhook...");
                
                var sigHeader = request.Headers["Stripe-Signature"];
                _logger.LogInformation("🔍 [StripeProvider] Stripe-Signature header present: {HasSignature}", !string.IsNullOrEmpty(sigHeader));
                
                var stripeEvent = EventUtility.ConstructEvent(
                    json: rawBody,
                    stripeSignatureHeader: sigHeader,
                    secret: _webhookSecret,
                    throwOnApiVersionMismatch: false
                );

                var type = stripeEvent.Type;
                _logger.LogInformation("🔍 [StripeProvider] Stripe event type: {EventType}, Event ID: {EventId}", type, stripeEvent.Id);

                if (type == EVT_CHECKOUT_COMPLETED)
                {
                    var session = (Session)stripeEvent.Data.Object;
                    _logger.LogInformation("✅ [StripeProvider] Matched {EventType} - Session ID: {SessionId}, PaymentStatus: {PaymentStatus}", 
                        type, session.Id, session.PaymentStatus);

                    // FIX 2a: Dùng toán tử ?? cho kiểu nullable `long?` (hiện đại hơn GetValueOrDefault)
                    long amount = session.AmountTotal ?? 0L;
                    var currency = string.IsNullOrWhiteSpace(session.Currency) ? "vnd" : session.Currency;

                    evt = new ProviderWebhookEvent(
                        Id: stripeEvent.Id,
                        Type: type,
                        ProviderPaymentId: session.Id,
                        Amount: amount,
                        Currency: currency,
                        RawJson: rawBody
                    );
                    _logger.LogInformation("✅ [StripeProvider] Webhook event parsed successfully");
                    return true;
                }
                else if (type == EVT_PI_SUCCEEDED || type == EVT_PI_FAILED)
                {
                    var pi = (PaymentIntent)stripeEvent.Data.Object;
                    _logger.LogInformation("✅ [StripeProvider] Matched {EventType} - PaymentIntent ID: {PaymentIntentId}, Status: {Status}", 
                        type, pi.Id, pi.Status);

                    // FIX 2b: `pi.Amount` là kiểu `long`, không phải `long?`. Gán trực tiếp.
                    long amount = pi.Amount;
                    var currency = string.IsNullOrWhiteSpace(pi.Currency) ? "vnd" : pi.Currency;

                    evt = new ProviderWebhookEvent(
                        Id: stripeEvent.Id,
                        Type: type,
                        ProviderPaymentId: pi.Id,
                        Amount: amount,
                        Currency: currency,
                        RawJson: rawBody
                    );
                    _logger.LogInformation("✅ [StripeProvider] Webhook event parsed successfully");
                    return true;
                }

                // FIX 1: Trả về false cho các sự kiện không được xử lý
                _logger.LogWarning("⚠️ [StripeProvider] Unhandled event type: {EventType}", type);
                return false;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "❌ [StripeProvider] Stripe exception during webhook parsing: {Message}", ex.Message);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [StripeProvider] Unexpected exception during webhook parsing");
                return false;
            }
        }
    }
}