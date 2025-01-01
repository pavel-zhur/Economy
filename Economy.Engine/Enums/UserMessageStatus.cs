using System.Text.Json.Serialization;

namespace Economy.Engine.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserMessageStatus
{
    Transcribing,
    Thinking,
    Applying,
    Done,
    Canceled,
    Failed,
}