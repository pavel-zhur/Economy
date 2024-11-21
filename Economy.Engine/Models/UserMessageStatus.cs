using System.Text.Json.Serialization;

namespace Economy.Engine.Models;

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