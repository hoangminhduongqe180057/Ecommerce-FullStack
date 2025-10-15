
using Ecom.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;

[ApiController]

[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;
    public HealthController(AppDbContext db) => _db = db;

    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        status = "ok",
        db = _db.Database.CanConnect(),
        products = _db.Products.Count()
    });
}
