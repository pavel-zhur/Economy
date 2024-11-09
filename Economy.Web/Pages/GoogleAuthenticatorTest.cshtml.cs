using Google.Authenticator;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages
{
    public class GoogleAuthenticatorTestModel : PageModel
    {
        [FromQuery]
        public string? Code { get; set; }

        public bool? IsValid { get; set; }

        public string Key => "aba7363bf8";

        public void OnGet()
        {
            if (!string.IsNullOrEmpty(Code))
            {
                var tfa = new TwoFactorAuthenticator();
                IsValid = tfa.ValidateTwoFactorPIN(Key, Code);
            }
        }
    }
}
