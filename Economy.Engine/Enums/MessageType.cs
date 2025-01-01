using System.Text.Json.Serialization;

namespace Economy.Engine.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MessageType
{
    UserText,
    UserVoice,
    AssistantText,
    SystemText,
    ActionLog,
}