using System.Text.Json.Serialization;

namespace Economy.Web.Hubs.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MessageType
{
    UserText,
    UserVoice,
    ServerText,
    SystemText,
    ActionLog,
    ChatClosed,
}