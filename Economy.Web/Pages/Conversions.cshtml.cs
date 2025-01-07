using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class ConversionsModel : PageModel
{
    [FromQuery] public ConversionsOrdering Ordering { get; set; } = ConversionsOrdering.IdDesc;

    public enum ConversionsOrdering
    {
        Id,
        IdDesc,
        DateAndTime,
        DateAndTimeDesc,
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("Dynamic/DynamicConversions", this);
    }
}