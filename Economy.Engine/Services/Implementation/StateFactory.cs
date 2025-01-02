using Economy.Common;
using Economy.Engine.Models.Internal;

namespace Economy.Engine.Services.Implementation;

internal class StateFactory<TState>(StateFactoryMemory<TState> stateFactoryMemory, IUserDataStorage userDataStorage) : IStateFactory<TState>
    where TState : class, IState, new()
{
    private readonly Lock _lock = new();
    private UserData<TState>? _detachedState;

    public async Task<TState> GetState()
    {
        return _detachedState?.State ?? (await stateFactoryMemory.GetOrCreate(userDataStorage)).State;
    }

    public async Task<UserData<TState>> GetUserData()
    {
        return _detachedState ?? await stateFactoryMemory.GetOrCreate(userDataStorage);
    }

    public async Task Save()
    {
        if (_detachedState != null)
        {
            throw new InvalidOperationException("State is detached");
        }

        await stateFactoryMemory.Save(userDataStorage);
    }

    public async Task InitializeDetached(IStateFactory<TState> from)
    {
        var state = await from.GetUserData();

        lock (_lock)
        {
            if (_detachedState != null)
            {
                throw new InvalidOperationException("State is already initialized");
            }

            _detachedState = state;
        }
    }
}
