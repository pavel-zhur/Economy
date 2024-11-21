using System.Text.Json.Serialization;

namespace Economy.Engine.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MessageType
{
    UserText,
    UserVoice,
    AssistantText,
    SystemText,
    ActionLog,
}