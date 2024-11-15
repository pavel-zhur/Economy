using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class EventsModel : PageModel
{
    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        return Partial("DynamicEvents");
    }
}