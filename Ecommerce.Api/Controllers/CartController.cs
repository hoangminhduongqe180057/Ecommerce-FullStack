using Ecom.Api.Domain.Entities;
using Ecom.Api.Dtos;
using Ecom.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ecom.Api.Controllers;

[ApiController]
[Route("api/v1/cart")]
[Authorize]
public class CartController(AppDbContext db, ILogger<CartController> logger) : ControllerBase
{
    Guid RequireUserId() =>
        Guid.TryParse(User.FindFirstValue("sub") ?? User.FindFirstValue("user_id"), out var id)
            ? id
            : throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct = default)
    {
        var uid = RequireUserId();
        logger.LogInformation("📋 Fetching cart for UserId: {UserId}", uid);

        var cart = await db.Carts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == uid, ct)
            ?? new Cart { Id = Guid.NewGuid(), UserId = uid, Items = [] };

        // Enrich cart items with product details
        var prodIds = cart.Items.Select(i => i.ProductId).Distinct().ToList();
        var prods = await db.Products
            .Where(p => prodIds.Contains(p.Id))
            .ToListAsync(ct);

        var lines = cart.Items
            .Select(i =>
            {
                var p = prods.FirstOrDefault(x => x.Id == i.ProductId);
                if (p == null) return null;
                var lineTotal = p.Price * i.Quantity;
                return new CartLineDto(p.Id, p.Name, p.ImageUrl, p.Price, i.Quantity, lineTotal);
            })
            .Where(x => x != null)
            .ToList()!;

        var total = lines.Sum(l => l.LineTotal);
        return Ok(new CartDto(lines, total));
    }

    [HttpPost("items")]
    public async Task<IActionResult> Add([FromBody] AddCartItemRequest req, CancellationToken ct = default)
    {
        if (req.Quantity < 1) return BadRequest(new { error = "Quantity must be >= 1" });

        var uid = RequireUserId();
        logger.LogInformation("➕ Adding item to cart. UserId: {UserId}, ProductId: {ProductId}, Qty: {Quantity}",
            uid, req.ProductId, req.Quantity);

        // Validate product exists
        var exists = await db.Products.AnyAsync(p => p.Id == req.ProductId, ct);
        if (!exists) return NotFound(new { error = "Product not found" });

        var cart = await db.Carts.FirstOrDefaultAsync(x => x.UserId == uid, ct);

        if (cart == null)
        {
            // Create new cart
            cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = uid,
                Items = [new CartItem { ProductId = req.ProductId, Quantity = req.Quantity }]
            };
            db.Carts.Add(cart);
            logger.LogInformation("🆕 Created new cart: {CartId}", cart.Id);
        }
        else
        {
            // Update existing cart
            var item = cart.Items.FirstOrDefault(i => i.ProductId == req.ProductId);
            if (item == null)
            {
                cart.Items.Add(new CartItem { ProductId = req.ProductId, Quantity = req.Quantity });
                logger.LogInformation("📦 Added new item to cart");
            }
            else
            {
                item.Quantity += req.Quantity;
                logger.LogInformation("📦 Updated item quantity: {OldQty} -> {NewQty}",
                    item.Quantity - req.Quantity, item.Quantity);
            }

            // ✅ FIX: Explicitly mark as modified to force EF Core to update JSONB column
            db.Entry(cart).State = EntityState.Modified;
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("✅ Cart saved successfully");

        return await Get(ct);
    }

    [HttpPut("items/{productId:guid}")]
    public async Task<IActionResult> Update(Guid productId, [FromBody] UpdateCartItemRequest req, CancellationToken ct = default)
    {
        if (req.Quantity < 1) return BadRequest(new { error = "Quantity must be >= 1" });

        var uid = RequireUserId();
        logger.LogInformation("✏️ Updating cart item. UserId: {UserId}, ProductId: {ProductId}, NewQty: {Quantity}",
            uid, productId, req.Quantity);

        var cart = await db.Carts.FirstOrDefaultAsync(x => x.UserId == uid, ct);
        if (cart == null) return NotFound(new { error = "Cart not found" });

        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null) return NotFound(new { error = "Item not found in cart" });

        var oldQty = item.Quantity;
        item.Quantity = req.Quantity;

        // ✅ FIX: Mark as modified
        db.Entry(cart).State = EntityState.Modified;

        await db.SaveChangesAsync(ct);
        logger.LogInformation("✅ Item quantity updated: {OldQty} -> {NewQty}", oldQty, req.Quantity);

        return await Get(ct);
    }

    [HttpDelete("items/{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId, CancellationToken ct = default)
    {
        var uid = RequireUserId();
        logger.LogInformation("🗑️ Removing cart item. UserId: {UserId}, ProductId: {ProductId}", uid, productId);

        var cart = await db.Carts.FirstOrDefaultAsync(x => x.UserId == uid, ct);
        if (cart == null) return NotFound(new { error = "Cart not found" });

        var itemToRemove = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (itemToRemove != null)
        {
            cart.Items.Remove(itemToRemove);

            // ✅ FIX: Mark as modified
            db.Entry(cart).State = EntityState.Modified;

            await db.SaveChangesAsync(ct);
            logger.LogInformation("✅ Item removed from cart");
        }
        else
        {
            logger.LogWarning("⚠️ Item not found in cart, no changes made");
        }

        return await Get(ct);
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken ct = default)
    {
        var uid = RequireUserId();
        logger.LogInformation("🧹 Clearing cart. UserId: {UserId}", uid);

        var cart = await db.Carts.FirstOrDefaultAsync(x => x.UserId == uid, ct);
        if (cart == null) return NotFound(new { error = "Cart not found" });

        cart.Items.Clear();

        // ✅ FIX: Mark as modified
        db.Entry(cart).State = EntityState.Modified;

        await db.SaveChangesAsync(ct);
        logger.LogInformation("✅ Cart cleared successfully");

        return Ok(new { message = "Cart cleared" });
    }
}