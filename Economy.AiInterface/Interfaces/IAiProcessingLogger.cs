namespace Economy.AiInterface.Interfaces;

public interface IAiProcessingLogger
{
    void OnFunctionInvoked(FunctionInvocationLog log);
}