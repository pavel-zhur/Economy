using Economy.UserStorage;
using Microsoft.AspNetCore.Authentication;

namespace Economy.Web.Services;

public class GoogleAuthService(IHttpContextAccessor httpContextAccessor) : IGoogleAuthService
{
    public async Task<string> GetAccessTokenAsync()
    {
        var httpContext = httpContextAccessor.HttpContext ?? throw new("The http context is unavailable.");
        var authenticateResult = await httpContext.AuthenticateAsync();
        return authenticateResult.Properties?.GetTokenValue("access_token") ?? throw new("The access_token is unavailable.");
    }
}