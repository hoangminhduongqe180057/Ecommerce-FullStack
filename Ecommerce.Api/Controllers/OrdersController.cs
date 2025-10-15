using Ecom.Api.Domain.Entities;
using Ecom.Api.Dtos;
using Ecom.Api.Enums;
using Ecom.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/v1/orders")]
[Authorize]
public class OrdersController(AppDbContext db, ILogger<OrdersController> logger) : ControllerBase
{
    Guid RequireUserId() =>
    Guid.TryParse(User.FindFirstValue("sub") ?? User.FindFirstValue("user_id"), out var id)
        ? id
        : throw new UnauthorizedAccessException();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req)
    {
        var uid = RequireUserId();
        if (req.Items == null || req.Items.Count == 0) return BadRequest("Items required");
        if (req.Items.Any(i => i.Quantity < 1)) return BadRequest("Quantity must be >= 1");

        logger.LogInformation("📦 Creating order for UserId: {UserId}, Items: {ItemCount}", uid, req.Items.Count);

        // load giá hiện hành
        var productIds = req.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();
        if (products.Count != productIds.Count) return BadRequest("Some productIds not found");

        // tính dòng + tổng
        var lines = new List<OrderItem>();
        foreach (var i in req.Items)
        {
            var p = products.First(x => x.Id == i.ProductId);
            var unit = p.Price;
            var line = new OrderItem
            {
                ProductId = p.Id,
                Name = p.Name,
                ImageUrl = p.ImageUrl,
                UnitPrice = unit,
                Quantity = i.Quantity,
                LineTotal = unit * i.Quantity
            };
            lines.Add(line);
        }
        var total = lines.Sum(l => l.LineTotal);

        // transaction tạo đơn
        using var tx = await db.Database.BeginTransactionAsync();
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = uid,
            TotalAmount = total,
            Status = OrderStatus.pending.ToString(),
            Products = lines
        };
        db.Orders.Add(order);

        // ✅ Enhanced: Only remove ordered items from cart (with partial quantity support)
        var cart = await db.Carts.FirstOrDefaultAsync(c => c.UserId == uid);
        if (cart != null)
        {
            var originalCartSize = cart.Items.Count;
            var remainingItems = new List<CartItem>();

            foreach (var cartItem in cart.Items)
            {
                var orderedItem = req.Items.FirstOrDefault(i => i.ProductId == cartItem.ProductId);
                
                if (orderedItem == null)
                {
                    // Product not in order, keep entire quantity in cart
                    remainingItems.Add(cartItem);
                }
                else if (cartItem.Quantity > orderedItem.Quantity)
                {
                    // Partially ordered, keep remaining quantity in cart
                    remainingItems.Add(new CartItem 
                    { 
                        ProductId = cartItem.ProductId, 
                        Quantity = cartItem.Quantity - orderedItem.Quantity 
                    });
                    logger.LogInformation("🔄 Partial order: Product {ProductId} - Cart: {CartQty}, Ordered: {OrderedQty}, Remaining: {RemainingQty}",
                        cartItem.ProductId, cartItem.Quantity, orderedItem.Quantity, cartItem.Quantity - orderedItem.Quantity);
                }
                else
                {
                    // Fully ordered, remove from cart
                    logger.LogInformation("✂️ Full order: Product {ProductId} - Removed from cart (Qty: {Qty})",
                        cartItem.ProductId, orderedItem.Quantity);
                }
            }

            cart.Items = remainingItems;
            db.Entry(cart).State = EntityState.Modified;
            
            logger.LogInformation("🛒 Cart updated: {OriginalItems} items → {RemainingItems} items", 
                originalCartSize, remainingItems.Count);
        }

        await db.SaveChangesAsync();
        await tx.CommitAsync();

        logger.LogInformation("✅ Order created successfully: {OrderId}, Total: {Total:C}, Items: {ItemCount}", 
            order.Id, total, lines.Count);

        var dto = new OrderDto(order.Id, order.UserId, order.TotalAmount, order.Status,
            lines.Select(l => new OrderLineDto(l.ProductId, l.Name, l.UnitPrice, l.Quantity, l.LineTotal, l.ImageUrl)).ToList(),
            order.CreatedAt);

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, dto);
    }

    [HttpGet]
    public async Task<IActionResult> ListMine()
    {
        var uid = RequireUserId();
        var orders = await db.Orders
            .Where(o => o.UserId == uid)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var dtos = orders.Select(o => new OrderDto(
            o.Id, o.UserId, o.TotalAmount, o.Status,
            o.Products.Select(l => new OrderLineDto(l.ProductId, l.Name, l.UnitPrice, l.Quantity, l.LineTotal, l.ImageUrl)).ToList(),
            o.CreatedAt)).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var uid = RequireUserId();
        var o = await db.Orders.FindAsync(id);
        if (o == null) return NotFound();
        if (o.UserId != uid) return Forbid();

        var dto = new OrderDto(
            o.Id, o.UserId, o.TotalAmount, o.Status,
            o.Products.Select(l => new OrderLineDto(l.ProductId, l.Name, l.UnitPrice, l.Quantity, l.LineTotal, l.ImageUrl)).ToList(),
            o.CreatedAt);
        return Ok(dto);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest req)
    {
        var status = req.Status.ToString().ToLowerInvariant();

        var o = await db.Orders.FindAsync(id);
        if (o == null) return NotFound();

        o.Status = status;
        await db.SaveChangesAsync();

        return Ok(new { o.Id, o.Status });
    }
}
