using MessagePack;

namespace Economy.Web.Hubs.Models;

[MessagePackObject]
public record ChatModel(
    [property: Key("chatId")] Guid ChatId,
    [property: Key("messages")] List<MessageModel> Messages,
    [property: Key("status")] ChatStatus Status);