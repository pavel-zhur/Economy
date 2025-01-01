using Economy.AiInterface.Services;
using Economy.Common;
using Economy.Engine.Models;

namespace Economy.Engine;

public class ChatsServiceContext<TState, TChatInitializer> 
    where TState : IState
    where TChatInitializer : IChatInitializer
{
    public required UserData<TState> UserData { get; init; }

    public required TChatInitializer ChatInitializer { get; init; }

    public required string UserId { get; init; }

    public required Func<StateModel, Task> SendUpdate { get; init; }

    public required AiTranscription AiTranscription { get; init; }

    public required AiCompletion AiCompletion { get; init; }
}