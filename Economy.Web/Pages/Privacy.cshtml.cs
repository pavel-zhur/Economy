using Economy.Memory.Containers.State;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PrivacyModel(ILogger<PrivacyModel> logger, State state) : PageModel
{
    public void OnGet()
    {
    }

    public async Task<RedirectResult> OnPostSave()
    {
        await state.SaveToFile();
        return Redirect("/Privacy");
    }
}

