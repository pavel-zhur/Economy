using Economy.Engine.Models;

namespace Economy.Engine;

public class ChatsServiceContext<TState, TChatInitializer>
{
    public required UserData<TState> UserData { get; init; }

    public required TChatInitializer ChatInitializer { get; init; }

    public required string UserId { get; init; }

    public required Func<StateModel, Task> SendUpdate { get; init; }
}