using Economy.AiInterface.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages
{
    public class FunctionsTraceModel(AiCompletion aiCompletion) : PageModel
    {
        public void OnGet()
        {
            Functions = aiCompletion.GetFunctions();
        }

        public IReadOnlyList<object> Functions { get; private set; }

        // on getjson
        public IActionResult OnGetJson()
        {
            OnGet();
            return new JsonResult(Functions);
        }
    }
}
