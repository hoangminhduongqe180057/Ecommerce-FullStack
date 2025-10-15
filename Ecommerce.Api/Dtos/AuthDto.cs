namespace Ecom.Api.Dtos;

/// <summary>
/// Request body for user registration
/// </summary>
public record RegisterRequest(
    string Email,
    string Password,
    string? FullName = null
);

/// <summary>
/// Request body for user login
/// </summary>
public record LoginRequest(
    string Email,
    string Password
);

/// <summary>
/// Response after successful login or registration
/// </summary>
public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    string TokenType,
    UserDto User
);

/// <summary>
/// User information
/// </summary>
public record UserDto(
    Guid Id,
    string Email,
    string? FullName,
    string? Phone,
    DateTime CreatedAt,
    DateTime? LastSignInAt,
    string? AppRole
);
