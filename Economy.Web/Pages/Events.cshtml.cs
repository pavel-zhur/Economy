using Economy.Memory.Containers.State;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages
{
    public class EventsModel(State state) : PageModel
    {
        public void OnGet()
        {
        }
        public IActionResult OnGetReload()
        {
            return Partial("_EventsPartial");
        }
    }
}
