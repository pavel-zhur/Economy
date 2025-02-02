using Economy.UserStorage;
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
        catch (ReauthenticationNeededException)
        {
            await context.ChallengeAsync(GoogleDefaults.AuthenticationScheme);
        }
        catch (InsufficientScopesException)
        {
            await context.ChallengeAsync(GoogleDefaults.AuthenticationScheme);
        }
    }
}