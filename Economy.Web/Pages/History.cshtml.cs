using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class HistoryModel : PageModel
{
    [FromQuery] public HistoryOrdering Ordering { get; set; } = HistoryOrdering.IdDesc;
    [FromQuery] public int? BranchId { get; set; }

    public enum HistoryOrdering
    {
        Id,
        IdDesc,
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("DynamicHistory", this);
    }
}