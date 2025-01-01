using Economy.AiInterface.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace Economy.AiInterface.Filters;

public class AutoFunctionInvocationFilter(IAiProcessingLogger aiProcessingLogger, ILogger<AutoFunctionInvocationFilter> logger) : IAutoFunctionInvocationFilter
{
    public async Task OnAutoFunctionInvocationAsync(AutoFunctionInvocationContext context, Func<AutoFunctionInvocationContext, Task> next)
    {
        try
        {
            await next(context);
            aiProcessingLogger.OnFunctionInvoked(new(true, context.Function.PluginName, context.Function.Name, context.Arguments));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error executing the function.");
            aiProcessingLogger.OnFunctionInvoked(new(false, context.Function.PluginName, context.Function.Name, context.Arguments, e.Message));
            throw;
        }
    }
}