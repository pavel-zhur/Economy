using System.Security.Claims;
using Economy.AiInterface.Scope;

namespace Economy.Web.Services;

public class StateUserGetter(IHttpContextAccessor httpContextAccessor) : IStateUserGetter
{
    public string GetStateUserKey()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user == null)
        {
            throw new InvalidOperationException("No user is currently logged in.");
        }

        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            throw new InvalidOperationException("User ID not found.");
        }

        return userId;
    }
}