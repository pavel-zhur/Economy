using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class TransfersModel : PageModel
{
    [FromQuery] public TransfersOrdering Ordering { get; set; } = TransfersOrdering.IdDesc;

    public enum TransfersOrdering
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
        return Partial("DynamicTransfers", this);
    }
}