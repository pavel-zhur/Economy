using System.Text.Json.Serialization;

namespace Economy.Engine.Enums;

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