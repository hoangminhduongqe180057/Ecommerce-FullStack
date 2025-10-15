using Ecom.Api.Dtos;

namespace Ecom.Api.Interface;

/// <summary>
/// Service interface for Supabase authentication operations
/// </summary>
public interface ISupabaseAuthService
{
    /// <summary>
    /// Register a new user
    /// </summary>
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);

    /// <summary>
    /// Authenticate user with email and password
    /// </summary>
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);

    /// <summary>
    /// Sign out user and invalidate refresh token
    /// </summary>
    Task<bool> LogoutAsync(string accessToken, CancellationToken ct = default);

    /// <summary>
    /// Get current user information from Supabase
    /// </summary>
    Task<UserDto?> GetUserAsync(string accessToken, CancellationToken ct = default);
}
