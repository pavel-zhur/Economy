using Microsoft.SemanticKernel;

namespace Economy.AiInterface.Filters;

[Obsolete("Debugging")] // todo: think
public class ChatDebuggingFilter : IAutoFunctionInvocationFilter, IPromptRenderFilter
{
    public async Task OnAutoFunctionInvocationAsync(AutoFunctionInvocationContext context, Func<AutoFunctionInvocationContext, Task> next)
    {
        await next(context);
    }

    public async Task OnPromptRenderAsync(PromptRenderContext context, Func<PromptRenderContext, Task> next)
    {
        await next(context);
    }
}