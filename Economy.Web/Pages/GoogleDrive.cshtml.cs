using Economy.Engine.Services;
using Economy.Memory.Containers.State;
using Economy.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

[Authorize]
public class GoogleDriveModel(ILogger<GoogleDriveModel> logger, IStateFactory<States> stateFactory, UserDataStorage userDataStorage, IHostEnvironment hostEnvironment) : PageModel
{
    public void OnGet()
    {
    }

    public async Task<RedirectResult> OnPostSave()
    {
        await stateFactory.Save();
        return Redirect("/GoogleDrive");
    }

    public async Task<RedirectResult> OnPostCopyUserDataToFile()
    {
        if (!hostEnvironment.IsDevelopment())
        {
            return Redirect("/GoogleDrive");
        }

        await userDataStorage.CopyUserDataToFile();
        return Redirect("/GoogleDrive");
    }

    public async Task<RedirectResult> OnPostUploadUserDataFromFile()
    {
        if (!hostEnvironment.IsDevelopment())
        {
            return Redirect("/GoogleDrive");
        }

        await userDataStorage.UploadUserDataFromFile();
        return Redirect("/GoogleDrive");
    }

    public async Task<FileResult> OnPostDownloadUserData()
    {
        var data = await userDataStorage.GetUserData();
        if (data == null)
        {
            throw new("User data not exists.");
        }

        return File(data, "application/octet-stream", "ai-economy user data.json");
    }

    public async Task<IActionResult> OnPostUploadUserData(IFormFile file)
    {
        if (file == null)
        {
            throw new("No file uploaded.");
        }

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        await userDataStorage.SaveUserData(stream.ToArray());
        return Redirect("/GoogleDrive");
    }
}