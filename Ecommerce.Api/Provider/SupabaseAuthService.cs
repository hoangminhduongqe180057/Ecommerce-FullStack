using System.Text;
using System.Text.Json;
using Ecom.Api.Dtos;
using Ecom.Api.Interface;

namespace Ecom.Api.Provider;

/// <summary>
/// Implementation of Supabase Auth API integration
/// </summary>
public sealed class SupabaseAuthService : ISupabaseAuthService
{
    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _supabaseAnonKey;
    private readonly ILogger<SupabaseAuthService> _logger;

    public SupabaseAuthService(
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<SupabaseAuthService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("Supabase");
        _supabaseUrl = config["Supabase:Url"] ?? throw new InvalidOperationException("Supabase:Url missing");
        _supabaseAnonKey = config["Supabase:AnonKey"] ?? throw new InvalidOperationException("Supabase:AnonKey missing");
        _logger = logger;

        // Setup default headers
        _httpClient.BaseAddress = new Uri(_supabaseUrl);
        _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseAnonKey);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("🔐 Registering new user: {Email}", request.Email);

        var payload = new
        {
            email = request.Email,
            password = request.Password,
            data = new
            {
                full_name = request.FullName
            }
        };

        var response = await _httpClient.PostAsJsonAsync("/auth/v1/signup", payload, ct);
        var content = await response.Content.ReadAsStringAsync(ct);

        _logger.LogInformation("📦 Supabase signup response ({StatusCode}): {Content}", 
            response.StatusCode, content.Length > 500 ? content.Substring(0, 500) + "..." : content);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("❌ Registration failed: {StatusCode} - {Content}", response.StatusCode, content);
            
            // Parse error message from Supabase
            try
            {
                using var doc = JsonDocument.Parse(content);
                if (doc.RootElement.TryGetProperty("msg", out var msgEl))
                {
                    var errorMsg = msgEl.GetString();
                    throw new InvalidOperationException(errorMsg ?? "Registration failed");
                }
            }
            catch (JsonException)
            {
                // Ignore JSON parse errors, use raw content
            }
            
            throw new InvalidOperationException($"Registration failed: {content}");
        }

        _logger.LogInformation("✅ User registered successfully: {Email}", request.Email);
        return ParseAuthResponse(content);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("🔐 Logging in user: {Email}", request.Email);

        var payload = new
        {
            email = request.Email,
            password = request.Password
        };

        var response = await _httpClient.PostAsJsonAsync("/auth/v1/token?grant_type=password", payload, ct);
        var content = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("❌ Login failed: {StatusCode} - {Content}", response.StatusCode, content);
            throw new InvalidOperationException($"Login failed: {content}");
        }

        _logger.LogInformation("✅ User logged in successfully: {Email}", request.Email);
        return ParseAuthResponse(content);
    }

    public async Task<bool> LogoutAsync(string accessToken, CancellationToken ct = default)
    {
        _logger.LogInformation("🔐 Logging out user");

        var request = new HttpRequestMessage(HttpMethod.Post, "/auth/v1/logout");
        request.Headers.Add("Authorization", $"Bearer {accessToken}");

        var response = await _httpClient.SendAsync(request, ct);

        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation("✅ User logged out successfully");
            return true;
        }

        _logger.LogWarning("⚠️ Logout returned: {StatusCode}", response.StatusCode);
        return false;
    }

    public async Task<UserDto?> GetUserAsync(string accessToken, CancellationToken ct = default)
    {
        _logger.LogInformation("🔐 Fetching user info");

        var request = new HttpRequestMessage(HttpMethod.Get, "/auth/v1/user");
        request.Headers.Add("Authorization", $"Bearer {accessToken}");

        var response = await _httpClient.SendAsync(request, ct);
        var content = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("❌ Failed to get user: {StatusCode} - {Content}", response.StatusCode, content);
            return null;
        }

        _logger.LogInformation("✅ User info fetched successfully");
        return ParseUserDto(content);
    }

    private AuthResponse ParseAuthResponse(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // Handle missing properties gracefully
        string? accessToken = null;
        string? refreshToken = null;
        int expiresIn = 3600; // Default 1 hour
        string tokenType = "bearer";

        if (root.TryGetProperty("access_token", out var accessTokenEl))
            accessToken = accessTokenEl.GetString();
        
        if (root.TryGetProperty("refresh_token", out var refreshTokenEl))
            refreshToken = refreshTokenEl.GetString();
        
        if (root.TryGetProperty("expires_in", out var expiresInEl))
            expiresIn = expiresInEl.GetInt32();
        
        if (root.TryGetProperty("token_type", out var tokenTypeEl))
            tokenType = tokenTypeEl.GetString() ?? "bearer";

        // Access token is required
        if (string.IsNullOrEmpty(accessToken))
        {
            _logger.LogError("❌ Missing access_token in response: {Json}", json);
            throw new InvalidOperationException("Invalid response from Supabase: missing access_token");
        }

        // Refresh token might be missing if email confirmation is required
        if (string.IsNullOrEmpty(refreshToken))
        {
            _logger.LogWarning("⚠️ Missing refresh_token in response (email confirmation may be required)");
            refreshToken = ""; // Set empty string to avoid null
        }

        if (!root.TryGetProperty("user", out var userElement))
        {
            _logger.LogError("❌ Missing user in response: {Json}", json);
            throw new InvalidOperationException("Invalid response from Supabase: missing user data");
        }

        var user = ParseUserFromElement(userElement);

        return new AuthResponse(accessToken, refreshToken, expiresIn, tokenType, user);
    }

    private UserDto ParseUserDto(string json)
    {
        using var doc = JsonDocument.Parse(json);
        return ParseUserFromElement(doc.RootElement);
    }

    private UserDto ParseUserFromElement(JsonElement userElement)
    {
        var id = Guid.Parse(userElement.GetProperty("id").GetString()!);
        var email = userElement.GetProperty("email").GetString()!;
        var createdAt = DateTime.Parse(userElement.GetProperty("created_at").GetString()!);

        string? fullName = null;
        string? phone = null;
        string? appRole = null;
        DateTime? lastSignInAt = null;

        // Parse user_metadata for full_name
        if (userElement.TryGetProperty("user_metadata", out var userMeta))
        {
            if (userMeta.TryGetProperty("full_name", out var nameEl))
                fullName = nameEl.GetString();
        }

        // Parse app_metadata for app_role
        if (userElement.TryGetProperty("app_metadata", out var appMeta))
        {
            if (appMeta.TryGetProperty("app_role", out var roleEl))
                appRole = roleEl.GetString();
        }

        // Parse phone
        if (userElement.TryGetProperty("phone", out var phoneEl) && phoneEl.ValueKind == JsonValueKind.String)
            phone = phoneEl.GetString();

        // Parse last_sign_in_at
        if (userElement.TryGetProperty("last_sign_in_at", out var lastSignInEl) && lastSignInEl.ValueKind == JsonValueKind.String)
            lastSignInAt = DateTime.Parse(lastSignInEl.GetString()!);

        return new UserDto(id, email, fullName, phone, createdAt, lastSignInAt, appRole);
    }
}
