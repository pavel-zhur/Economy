using Economy.UserStorage;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class ProfileModel : PageModel
{
    private readonly IGoogleAuthService _googleAuthService;

    public ProfileModel(IGoogleAuthService googleAuthService)
    {
        _googleAuthService = googleAuthService;
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetLogin()
    {
        var redirectUrl = Url.Page("/Index");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    public async Task<IActionResult> OnGetLogout()
    {
        await _googleAuthService.RevokeTokensAsync();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        var redirectUrl = Url.Page("/Index");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return SignOut(properties, CookieAuthenticationDefaults.AuthenticationScheme);
    }
}
