using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PlanningNodesModel : PageModel
{
    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        return Partial("DynamicPlanningNodes");
    }
}