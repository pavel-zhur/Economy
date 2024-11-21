using MessagePack;

namespace Economy.Engine.Models;

[MessagePackObject]
public record MessageModel(
    [property: Key("timestamp")] DateTime Timestamp,
    [property: Key("type")] MessageType Type, 
    [property: Key("messageId")] string? MessageId,
    [property: Key("text")] string? Text,
    [property: Key("status")] UserMessageStatus? Status,
    [property: Key("systemMessageSeverity")] SystemMessageSeverity? SystemMessageSeverity);