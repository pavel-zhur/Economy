using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class BranchesModel : PageModel
{
    [FromQuery] public BranchesOrdering Ordering { get; set; } = BranchesOrdering.Date;

    public enum BranchesOrdering
    {
        Id,
        IdDesc,
        Date,
        DateDesc,
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("Dynamic/DynamicBranches", this);
    }
}