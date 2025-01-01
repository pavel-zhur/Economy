using Economy.AiInterface.Interfaces;

namespace Economy.Engine.Services.Implementation;

internal class AiProcessingLogger : IAiProcessingLogger
{
    [Obsolete] // todo
    public void OnFunctionInvoked(FunctionInvocationLog log)
    {
        Console.WriteLine(log);
    }
}