using MessagePack;

namespace Economy.Engine.Models;

[MessagePackObject]
public record StateModel(
    [property: Key("latestRevision")] int LatestRevision,
    [property: Key("chats")] IReadOnlyList<ChatModel> Chats);