using System.Text.Json;
using Microsoft.SemanticKernel;

namespace Economy.AiInterface.Interfaces;

public record FunctionInvocationLog(bool Success, string? PluginName, string FunctionName, KernelArguments? Arguments = null, string? ErrorMessage = null)
{
    public override string ToString()
    {
        return $"{PluginName}.{FunctionName}{(ErrorMessage == null ? null : $": {ErrorMessage}")}";
    }

    public string? ToAdditionalData()
    {
        return Arguments == null
            ? null
            : JsonSerializer.Serialize(Arguments, new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
    }
}