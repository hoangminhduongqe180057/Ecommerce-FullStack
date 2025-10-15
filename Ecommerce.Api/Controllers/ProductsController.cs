using Ecom.Api.Authorization;
using Ecom.Api.Domain.Entities;
using Ecom.Api.Dtos;
using Ecom.Api.Helpers;
using Ecom.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecom.Api.Controllers
{
    [ApiController]
    [Route("api/v1/products")]
    public class ProductsController(AppDbContext db) : ControllerBase
    {
        /// <summary>
        /// Retrieves a paginated list of products, optionally filtered by a search term and sorted by a specified
        /// field.
        /// </summary>
        /// <param name="search">An optional search term to filter products by name. If null or empty, no filtering is applied.</param>
        /// <param name="page">The page number to retrieve. Must be 1 or greater. Defaults to 1.</param>
        /// <param name="limit">The maximum number of products to include in the response. Must be 1 or greater. Defaults to 12.</param>
        /// <param name="sort">An optional sort order for the results. Supported values are: <list type="bullet">
        /// <item><description><c>"price:asc"</c> - Sorts by price in ascending order.</description></item>
        /// <item><description><c>"price:desc"</c> - Sorts by price in descending order.</description></item>
        /// <item><description><c>"created_at:desc"</c> (default) - Sorts by creation date in descending
        /// order.</description></item> </list> If an unsupported value is provided, the default sort order is applied.</param>
        /// <returns>An <see cref="IActionResult"/> containing a JSON object with the following properties: <list type="bullet">
        /// <item><description><c>items</c> - A list of products matching the specified criteria, represented as <see
        /// cref="ProductDto"/> objects.</description></item> <item><description><c>page</c> - The current page
        /// number.</description></item> <item><description><c>limit</c> - The maximum number of products per
        /// page.</description></item> <item><description><c>total</c> - The total number of products matching the
        /// criteria.</description></item> </list></returns>
        [HttpGet]
        public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int limit = 12, [FromQuery] string? sort = "created_at:desc")
        {
            var q = db.Products.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(p => EF.Functions.ILike(p.Name, $"%{search}%"));
            // sort đơn giản
            q = sort is "price:asc" ? q.OrderBy(x => x.Price)
                : sort is "price:desc" ? q.OrderByDescending(x => x.Price)
                : q.OrderByDescending(x => x.CreatedAt);

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * limit).Take(limit)
                .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.ImageUrl, p.CreatedAt))
                .ToListAsync();

            return Ok(new { items, page, limit, total });
        }

        /// <summary>
        /// Retrieves all products without pagination.
        /// </summary>
        /// <remarks>
        /// This endpoint returns all products in the database, sorted by creation date (newest first).
        /// Useful for displaying products on the homepage or for frontend applications that need to load all products at once.
        /// ⚠️ Use with caution if you have a large number of products. Consider using the paginated endpoint instead.
        /// </remarks>
        /// <param name="sort">An optional sort order for the results. Supported values are: <list type="bullet">
        /// <item><description><c>"price:asc"</c> - Sorts by price in ascending order.</description></item>
        /// <item><description><c>"price:desc"</c> - Sorts by price in descending order.</description></item>
        /// <item><description><c>"name:asc"</c> - Sorts by name in ascending order.</description></item>
        /// <item><description><c>"name:desc"</c> - Sorts by name in descending order.</description></item>
        /// <item><description><c>"created_at:desc"</c> (default) - Sorts by creation date in descending order.</description></item>
        /// <item><description><c>"created_at:asc"</c> - Sorts by creation date in ascending order.</description></item>
        /// </list></param>
        /// <returns>An <see cref="IActionResult"/> containing a JSON array of all products as <see cref="ProductDto"/> objects.</returns>
        [HttpGet("all")]
        public async Task<IActionResult> GetAll([FromQuery] string? sort = "created_at:desc")
        {
            var q = db.Products.AsQueryable();

            // Apply sorting
            q = sort switch
            {
                "price:asc" => q.OrderBy(x => x.Price),
                "price:desc" => q.OrderByDescending(x => x.Price),
                "name:asc" => q.OrderBy(x => x.Name),
                "name:desc" => q.OrderByDescending(x => x.Name),
                "created_at:asc" => q.OrderBy(x => x.CreatedAt),
                _ => q.OrderByDescending(x => x.CreatedAt) // Default: newest first
            };

            var products = await q
                .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.ImageUrl, p.CreatedAt))
                .ToListAsync();

            return Ok(products);
        }

        /// <summary>
        /// Retrieves a product by its unique identifier.
        /// </summary>
        /// <remarks>This method performs a lookup for a product in the database using the specified
        /// <paramref name="id"/>. If the product exists, it returns an HTTP 200 response with the product details. If
        /// the product does not exist, it returns an HTTP 404 response.</remarks>
        /// <param name="id">The unique identifier of the product to retrieve.</param>
        /// <returns>An <see cref="IActionResult"/> containing the product details as a <see cref="ProductDto"/> if the product
        /// is found; otherwise, a <see cref="NotFoundResult"/>.</returns>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var p = await db.Products.FindAsync(id);
            return p is null ? NotFound() :
                Ok(new ProductDto(p.Id, p.Name, p.Description, p.Price, p.ImageUrl, p.CreatedAt));
        }

        /// <summary>
        /// Creates a new product and saves it to the database.
        /// </summary>
        /// <remarks>This action requires the user to be authenticated. The product is associated with the
        /// user who created it.</remarks>
        /// <param name="req">The request object containing the details of the product to create, including its name, description, price,
        /// and image URL.</param>
        /// <returns>A <see cref="CreatedAtActionResult"/> containing the details of the newly created product, including its ID,
        /// name, description, price, image URL, and creation timestamp.</returns>
        [Authorize(Policy = Policies.AdminOnly)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
        {
            var userId = HttpContextUser.UserId(User);
            var p = new Product
            {
                Id = Guid.NewGuid(),
                Name = req.Name,
                Description = req.Description,
                Price = req.Price,
                ImageUrl = req.ImageUrl,
                CreatedBy = userId
            };
            db.Products.Add(p);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = p.Id },
                new ProductDto(p.Id, p.Name, p.Description, p.Price, p.ImageUrl, p.CreatedAt));
        }

        /// <summary>
        /// Updates the details of an existing product.
        /// </summary>
        /// <remarks>This method requires authorization and is accessible only to authenticated users. 
        /// Partial updates are supported; only the fields provided in the <paramref name="req"/> object will be
        /// modified.</remarks>
        /// <param name="id">The unique identifier of the product to update.</param>
        /// <param name="req">The request containing the updated product details. Only non-null fields will be applied.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.  Returns <see cref="NotFoundResult"/>
        /// if the product with the specified <paramref name="id"/> does not exist.  Returns <see
        /// cref="OkObjectResult"/> containing the updated product details if the operation is successful.</returns>
    [Authorize(Policy = Policies.AdminOnly)]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest req)
        {
            var p = await db.Products.FindAsync(id);
            if (p is null) return NotFound();

            if (req.Name is not null) p.Name = req.Name;
            if (req.Description is not null) p.Description = req.Description;
            if (req.Price is not null) p.Price = req.Price.Value;
            if (req.ImageUrl is not null) p.ImageUrl = req.ImageUrl;

            await db.SaveChangesAsync();
            return Ok(new ProductDto(p.Id, p.Name, p.Description, p.Price, p.ImageUrl, p.CreatedAt));
        }

        /// <summary>
        /// Deletes the product with the specified identifier.
        /// </summary>
        /// <remarks>This operation requires authorization. Ensure the caller has the necessary
        /// permissions.</remarks>
        /// <param name="id">The unique identifier of the product to delete.</param>
        /// <returns>A <see cref="NoContentResult"/> if the product was successfully deleted;  otherwise, a <see
        /// cref="NotFoundResult"/> if no product with the specified identifier exists.</returns>
    [Authorize(Policy = Policies.AdminOnly)]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var p = await db.Products.FindAsync(id);
            if (p is null) return NotFound();
            db.Products.Remove(p);
            await db.SaveChangesAsync();
            return Ok("Đã xóa thành công.");
        }

        /// <summary>
        /// Verifies the validity of the current user's authentication token.
        /// </summary>
        /// <remarks>This endpoint checks whether the current user's authentication token is valid and
        /// returns the associated user ID if the token is valid.</remarks>
        /// <returns>An <see cref="IActionResult"/> containing a success message and the user ID if the token is valid.</returns>
        [Authorize]
        [HttpGet("auth-check")]
        public IActionResult CheckAuth()
        {
            var userId = HttpContextUser.UserId(User);
            return Ok($"Token hợp lệ. UserId: {userId}");
        }

    }
}
