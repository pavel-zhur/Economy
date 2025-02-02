﻿using Economy.Engine.Services;
using Economy.Memory.Containers.State;
using Economy.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PrivacyModel(ILogger<PrivacyModel> logger, IStateFactory<States> stateFactory, UserDataStorage userDataStorage, IHostEnvironment hostEnvironment) : PageModel
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
        if (!hostEnvironment.IsDevelopment())
        {
            return Redirect("/Privacy");
        }

        await userDataStorage.CopyUserDataToFile();
        return Redirect("/Privacy");
    }

    public async Task<RedirectResult> OnPostUploadUserDataFromFile()
    {
        if (!hostEnvironment.IsDevelopment())
        {
            return Redirect("/Privacy");
        }

        await userDataStorage.UploadUserDataFromFile();
        return Redirect("/Privacy");
    }
}