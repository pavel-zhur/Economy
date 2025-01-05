using Economy.Engine.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace Economy.Web.Services;

public class ChatsRenderer(IRazorViewEngine razorViewEngine, IServiceScopeFactory serviceScopeFactory)
{
    public async Task<string> RenderChatsToHtmlAsync(IReadOnlyList<ChatModel> model)
    {
        using var scope = serviceScopeFactory.CreateScope();

        var stringWriter = new StringWriter();

        var actionContext = new ActionContext(
            new DefaultHttpContext { RequestServices = scope.ServiceProvider, },
            new(),
            new()
        );

        var viewResult = razorViewEngine.FindView(actionContext, "_ChatsPartial", false);

        if (!viewResult.Success)
        {
            throw new InvalidOperationException($"Unable to find view '_ChatsPartial': {string.Join(", ", viewResult.SearchedLocations)}");
        }

        var viewContext = new ViewContext(
            actionContext,
            viewResult.View,
            new ViewDataDictionary<IReadOnlyList<ChatModel>>(
                new EmptyModelMetadataProvider(),
                new())
            {
                Model = model
            },
            new TempDataDictionary(actionContext.HttpContext, scope.ServiceProvider.GetRequiredService<ITempDataProvider>()),
            stringWriter,
            new()
        );

        await viewResult.View.RenderAsync(viewContext);

        return stringWriter.ToString();
    }
}