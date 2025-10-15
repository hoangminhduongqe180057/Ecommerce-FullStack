using System.Security.Claims;

namespace Ecom.Api.Helpers
{
    public static class HttpContextUser
    {
        public static Guid? UserId(ClaimsPrincipal user)
        {
            var raw =
                user.FindFirstValue("sub") ??
                user.FindFirstValue("user_id") ??
                user.FindFirstValue(ClaimTypes.NameIdentifier); // map mặc định

            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }
}
