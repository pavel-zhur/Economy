using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PlansModel : PageModel
{
    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("Dynamic/DynamicPlans", this);
    }
}