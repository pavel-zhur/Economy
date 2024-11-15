using System.Text.Json.Serialization;

namespace Economy.Web.Hubs.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SystemMessageSeverity
{
    Info,
    Error,
    Success,
}