using System.Text.Json.Serialization;

namespace Economy.Engine.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SystemMessageSeverity
{
    Info,
    Error,
    Success,
}