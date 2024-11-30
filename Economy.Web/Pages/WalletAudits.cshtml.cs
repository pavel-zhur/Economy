using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class WalletAuditsModel : PageModel
{
    [FromQuery] public WalletAuditsOrdering Ordering { get; set; } = WalletAuditsOrdering.IdDesc;

    public enum WalletAuditsOrdering
    {
        Id,
        IdDesc,
        CheckDateAndTime,
        CheckDateAndTimeDesc,
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("DynamicWalletAudits", this);
    }
}