namespace Economy.Web.Services;

public class SessionAvailability(IHttpContextAccessor httpContextAccessor)
{
    public bool IsSessionAvailable()
    {
        // get context
        var httpContext = httpContextAccessor.HttpContext;
        return httpContext?.User.Identity?.IsAuthenticated == true;
    }
}