using Microsoft.SemanticKernel;

namespace Economy.AiInterface.StateManagement;

[Obsolete("Debugging")] // todo: think
public class ChatDebuggingFilter : IAutoFunctionInvocationFilter
{
    public async Task OnAutoFunctionInvocationAsync(AutoFunctionInvocationContext context, Func<AutoFunctionInvocationContext, Task> next)
    {
        await next(context);
    }
}