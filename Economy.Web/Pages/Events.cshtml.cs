using Economy.Memory.Containers.State;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages
{
    public class EventsModel(State state) : PageModel
    {
        public void OnGet()
        {
        }
    }
}
