using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class EventsModel : PageModel
{
    [FromQuery] public EventsOrdering Ordering { get; set; } = EventsOrdering.IdDesc;

    public enum EventsOrdering
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
        return Partial("DynamicEvents", this);
    }
}