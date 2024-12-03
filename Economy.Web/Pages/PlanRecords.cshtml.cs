using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PlanRecordsModel : PageModel
{
    [FromQuery] public PlanRecordsOrdering Ordering { get; set; } = PlanRecordsOrdering.DateDesc;

    [FromQuery] public int? PlanId { get; set; }

    public enum PlanRecordsOrdering
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
        return Partial("DynamicPlanRecords", this);
    }
}