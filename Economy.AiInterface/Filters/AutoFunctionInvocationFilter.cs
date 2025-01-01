using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace Economy.AiInterface.Filters;

public class AutoFunctionInvocationFilter(ILogger<AutoFunctionInvocationFilter> logger) : IAutoFunctionInvocationFilter
{
    public async Task OnAutoFunctionInvocationAsync(AutoFunctionInvocationContext context, Func<AutoFunctionInvocationContext, Task> next)
    {
        try
        {
            await next(context);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error executing the function.");
            throw;
        }
    }
}