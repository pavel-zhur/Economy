namespace Economy.Web.Hubs.Models;

public record MessageModel(
    DateTime Timestamp,
    MessageType Type, 
    string? RandomMessageId,
    string? Text,
    byte[]? AudioData,
    UserMessageStatus? Status,
    SystemMessageSeverity? SystemMessageSeverity);