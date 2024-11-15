using MessagePack;

namespace Economy.Web.Hubs.Models;

[MessagePackObject]
public record MessageModel(
    [property: Key("timestamp")] DateTime Timestamp,
    [property: Key("type")] MessageType Type, 
    [property: Key("randomMessageId")] string? RandomMessageId,
    [property: Key("text")] string? Text,
    [property: Key("status")] UserMessageStatus? Status,
    [property: Key("systemMessageSeverity")] SystemMessageSeverity? SystemMessageSeverity);