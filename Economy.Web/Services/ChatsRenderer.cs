using Economy.Web.Hubs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
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
            new RouteData(),
            new ActionDescriptor()
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
                new ModelStateDictionary())
            {
                Model = model
            },
            new TempDataDictionary(actionContext.HttpContext, scope.ServiceProvider.GetRequiredService<ITempDataProvider>()),
            stringWriter,
            new HtmlHelperOptions()
        );

        await viewResult.View.RenderAsync(viewContext);

        return stringWriter.ToString();
    }
}
