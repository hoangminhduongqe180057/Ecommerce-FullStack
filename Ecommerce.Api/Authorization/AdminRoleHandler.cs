using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace Ecom.Api.Authorization
{
    public sealed class AdminRoleHandler : AuthorizationHandler<AdminRoleRequirement>
    {
        private readonly ILogger<AdminRoleHandler> _logger;

        public AdminRoleHandler(ILogger<AdminRoleHandler> logger)
        {
            _logger = logger;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, AdminRoleRequirement requirement)
        {
            var user = context.User;

            // Log all claims for debugging
            _logger.LogInformation("🔍 [AdminRoleHandler] Checking admin role. Claims: {Claims}", 
                string.Join(", ", user.Claims.Select(c => $"{c.Type}={c.Value}")));

            // 1) Nếu đã có claim phẳng "app_role" (được thêm ở OnTokenValidated) thì dùng ngay
            var flatRole = user.FindFirst("app_role")?.Value;
            _logger.LogInformation("🔍 [AdminRoleHandler] Flat app_role claim: {Role}", flatRole ?? "null");
            
            if (string.Equals(flatRole, "admin", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("✅ [AdminRoleHandler] Admin access GRANTED via flat claim");
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // 2) Nếu chưa có, thử lấy từ "app_metadata" (Supabase thường nhét vào claim JSON string)
            var appMetaJson = user.FindFirst("app_metadata")?.Value;
            _logger.LogInformation("🔍 [AdminRoleHandler] app_metadata claim: {Metadata}", appMetaJson ?? "null");
            
            if (!string.IsNullOrWhiteSpace(appMetaJson))
            {
                try
                {
                    using var doc = JsonDocument.Parse(appMetaJson);
                    if (doc.RootElement.TryGetProperty("app_role", out var roleProp) &&
                        roleProp.ValueKind == JsonValueKind.String)
                    {
                        var role = roleProp.GetString();
                        _logger.LogInformation("🔍 [AdminRoleHandler] Role from app_metadata: {Role}", role);
                        
                        if (string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
                        {
                            _logger.LogInformation("✅ [AdminRoleHandler] Admin access GRANTED via app_metadata");
                            context.Succeed(requirement);
                            return Task.CompletedTask;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "⚠️ [AdminRoleHandler] Failed to parse app_metadata JSON");
                }
            }

            // 3) (Tuỳ chọn) hỗ trợ thêm các cách đặt claim khác nếu bạn dùng sau này
            // var roles = user.FindAll("roles").Select(c => c.Value);
            // if (roles.Contains("admin", StringComparer.OrdinalIgnoreCase)) { context.Succeed(requirement); }

            _logger.LogWarning("❌ [AdminRoleHandler] Admin access DENIED - no valid admin role found");
            return Task.CompletedTask;
        }
    }
}
