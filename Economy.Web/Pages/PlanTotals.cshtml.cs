using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PlanTotalsModel : PageModel
{
    [FromQuery] public PlanTotalsOrdering Ordering { get; set; } = PlanTotalsOrdering.DateDesc;

    [FromQuery] public int? PlanId { get; set; }

    public enum PlanTotalsOrdering
    {
        Date,
        DateDesc,
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("Dynamic/DynamicPlanTotals", this);
    }
}