using MessagePack;

namespace Economy.Web.Hubs.Models;

[MessagePackObject]
public record ChatModel(
    [property: Key("randomChatId")] string RandomChatId,
    [property: Key("messages")] List<MessageModel> Messages,
    [property: Key("status")] ChatStatus Status);