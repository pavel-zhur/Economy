using Economy.Engine.Enums;
using MessagePack;

namespace Economy.Engine.Models;

[MessagePackObject]
public record StateModel(
    [property: Key("latestRevision")] int LatestRevision,
    [property: Key("chats")] IReadOnlyList<ChatModel> Chats)
{
    public static StateModel GetFatalErrorHelloResponse()
    {
        return new(
            0,
            [
                new(
                    Guid.NewGuid(),
                    [
                        new(
                            DateTime.UtcNow,
                            MessageType.AssistantText,
                            null,
                            "A server error occurred. A page refresh could help.",
                            null,
                            SystemMessageSeverity.Error)
                    ],
                    ChatStatus.FatalError
                )
            ]);
    }
}