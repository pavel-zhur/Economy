using Economy.UserStorage;
using Economy.Web.Tools;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Economy.Web.Services;

public class GoogleAuthService(IHttpContextAccessor httpContextAccessor, IAuthenticationService authenticationService, ILogger<GoogleAuthService> logger) : IGoogleAuthService
{
    public async Task<string> GetAccessTokenAsync()
    {
        var httpContext = httpContextAccessor.HttpContext ?? throw new InvalidOperationException("The http context is unavailable.");
        var authenticateResult = await httpContext.AuthenticateAsync();

        var accessToken = authenticateResult.Properties?.GetTokenValue("access_token");

        return accessToken ?? throw new InvalidOperationException("The access_token is unavailable.");
    }

    public async Task RevokeTokensAsync()
    {
        var httpContext = httpContextAccessor.HttpContext ?? throw new InvalidOperationException("The http context is unavailable.");
        var authenticateResult = await httpContext.AuthenticateAsync();

        var accessToken = authenticateResult.Properties?.GetTokenValue("access_token");
        var refreshToken = authenticateResult.Properties?.GetTokenValue("refresh_token");

        if (!string.IsNullOrEmpty(refreshToken))
        {
            await RevokeTokenAsync(refreshToken);
        }

        if (!string.IsNullOrEmpty(accessToken))
        {
            await RevokeTokenAsync(accessToken);
        }
    }

    private async Task RevokeTokenAsync(string token)
    {
        try
        {
            using var httpClient = new HttpClient();
            var response = await httpClient.PostAsync($"https://oauth2.googleapis.com/revoke?token={token}", null);
            response.EnsureSuccessStatusCode();
            logger.LogInformation("The token revoked successfully.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to revoke the token.");
        }
    }

    private bool TokenExpired(AuthenticationProperties properties)
    {
        var expiresAt = properties.GetTokenValue("expires_at");
        if (DateTime.TryParse(expiresAt, out var expiresAtDateTime))
        {
            return expiresAtDateTime < DateTime.UtcNow;
        }
        return true;
    }
}