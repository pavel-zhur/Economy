using System.Text.Json.Serialization;

namespace Economy.Web.Hubs.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ChatStatus
{
    Success,
    Processing,
    Error,
    FatalError,

    // never reaches front-end
    Closed,
}