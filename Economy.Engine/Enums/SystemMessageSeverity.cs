using System.Text.Json.Serialization;

namespace Economy.Engine.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SystemMessageSeverity
{
    Info,
    Error,
    Success,
}