using MessagePack;

namespace Economy.Web.Hubs.Models;

[MessagePackObject]
public record StateModel(
    [property: Key("latestRevision")] int LatestRevision,
    [property: Key("chats")] IReadOnlyList<ChatModel> Chats,
    [property: Key("renderedChats")] string RenderedChats);