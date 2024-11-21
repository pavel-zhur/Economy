using System.Text.Json.Serialization;

namespace Economy.Engine.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ChatStatus
{
    Ready,
    Success,
    Processing,
    Error,
    FatalError,

    // never reaches front-end
    Closed,
}