using Economy.UserStorage;
using Economy.Web.Tools;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;

namespace Economy.Web.Services;

public class ReauthenticationMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ReauthenticationRequiredException)
        {
            await context.ChallengeAsync(GoogleDefaults.AuthenticationScheme);
        }
        catch (InsufficientScopesException)
        {
            await context.ChallengeAsync(GoogleDefaults.AuthenticationScheme);
        }
    }
}