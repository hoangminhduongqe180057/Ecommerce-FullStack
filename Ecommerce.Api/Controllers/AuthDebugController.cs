using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/v1/auth-debug")]
public class AuthDebugController : ControllerBase
{
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me() => Ok(new
    {
        isAuth = User.Identity?.IsAuthenticated,
        sub = User.FindFirstValue("sub"),
        user_id = User.FindFirstValue("user_id"),
        nameid = User.FindFirstValue(ClaimTypes.NameIdentifier),
        iss = User.FindFirstValue("iss"),
        aud = User.FindFirstValue("aud")
    });
}
