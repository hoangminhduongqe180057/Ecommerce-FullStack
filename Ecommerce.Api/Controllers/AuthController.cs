using Ecom.Api.Dtos;
using Ecom.Api.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecom.Api.Controllers;

/// <summary>
/// Authentication endpoints for user registration, login, and logout
/// </summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController(
    ISupabaseAuthService authService,
    ILogger<AuthController> logger) : ControllerBase
{
    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="request">Registration details including email, password, and optional full name</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Authentication response with access token and user information</returns>
    /// <response code="200">User registered successfully</response>
    /// <response code="400">Invalid registration data or user already exists</response>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        try
        {
            logger.LogInformation("📝 Registration request for: {Email}", request.Email);
            var response = await authService.RegisterAsync(request, ct);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "❌ Registration failed for: {Email}", request.Email);
            return BadRequest(new { error = "Registration failed", message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "💥 Unexpected error during registration for: {Email}", request.Email);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    /// <param name="request">Login credentials (email and password)</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Authentication response with access token and user information</returns>
    /// <response code="200">Login successful</response>
    /// <response code="400">Invalid credentials</response>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            logger.LogInformation("🔑 Login request for: {Email}", request.Email);
            var response = await authService.LoginAsync(request, ct);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "❌ Login failed for: {Email}", request.Email);
            return BadRequest(new { error = "Login failed", message = "Invalid email or password" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "💥 Unexpected error during login for: {Email}", request.Email);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Sign out the current user and invalidate refresh token
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Success status</returns>
    /// <response code="200">Logout successful</response>
    /// <response code="401">Unauthorized - invalid or missing token</response>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        try
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            logger.LogInformation("🚪 Logout request");
            
            var success = await authService.LogoutAsync(token, ct);
            
            if (success)
                return Ok(new { message = "Logged out successfully" });
            
            return BadRequest(new { error = "Logout failed" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "💥 Unexpected error during logout");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    /// <returns>User profile information</returns>
    /// <response code="200">User information retrieved successfully</response>
    /// <response code="401">Unauthorized - invalid or missing token</response>
    /// <response code="404">User not found</response>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        try
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            logger.LogInformation("👤 Get user info request");
            
            var user = await authService.GetUserAsync(token, ct);
            
            if (user == null)
                return NotFound(new { error = "User not found" });
            
            return Ok(user);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "💥 Unexpected error while fetching user info");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
