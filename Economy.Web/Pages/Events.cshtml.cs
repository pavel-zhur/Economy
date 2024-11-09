using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

[Authorize]
public class EventsModel : PageModel
{
    public void OnGet()
    {
    }
    public IActionResult OnGetReload()
    {
        return Partial("_EventsPartial");
    }
}