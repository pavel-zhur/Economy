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
            aiProcessingLogger.OnFunctionInvoked(new(context.Function.Name));
            await next(context);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error executing the function.");
            throw;
        }
    }
}