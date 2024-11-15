using Economy.AiInterface.Scope;
using Economy.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PrivacyModel(ILogger<PrivacyModel> logger, StateFactory stateFactory, UserDataStorage userDataStorage) : PageModel
{
    public void OnGet()
    {
    }

    public async Task<RedirectResult> OnPostSave()
    {
        await stateFactory.Save();
        return Redirect("/Privacy");
    }

    public async Task<RedirectResult> OnPostCopyUserDataToFile()
    {
        await userDataStorage.CopyUserDataToFile();
        return Redirect("/Privacy");
    }

    public async Task<RedirectResult> OnPostUploadUserDataFromFile()
    {
        await userDataStorage.UploadUserDataFromFile();
        return Redirect("/Privacy");
    }
}