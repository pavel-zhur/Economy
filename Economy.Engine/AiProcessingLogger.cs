using Economy.AiInterface.Interfaces;

namespace Economy.Engine;

public class AiProcessingLogger : IAiProcessingLogger
{
    [Obsolete] // todo
    public void OnFunctionInvoked(FunctionInvocationLog log)
    {
        Console.WriteLine(log);
    }
}