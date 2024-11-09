using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class ProfileModel : PageModel
{
    public void OnGet()
    {
        }

    public IActionResult OnPostLogin()
    {
            var redirectUrl = Url.Page("/Index");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

    public IActionResult OnPostLogout()
    {
            var redirectUrl = Url.Page("/Index");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return SignOut(properties, CookieAuthenticationDefaults.AuthenticationScheme);
        }
}