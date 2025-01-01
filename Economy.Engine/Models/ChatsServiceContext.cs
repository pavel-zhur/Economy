namespace Economy.Engine.Models;

public class ChatsServiceContext
{
    public required string UserId { get; init; }

    public required Func<StateModel, Task> SendUpdate { get; init; }
}