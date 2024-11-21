using Economy.Common;

namespace Economy.Engine;

public class StateFactory<TState>(FactoriesMemory<TState> factoriesMemory, IUserDataStorage userDataStorage)
    where TState : class, IState, new()
{
    private readonly object _lock = new();
    private UserData<TState>? _detachedState;

    public async Task<TState> GetState()
    {
        return _detachedState?.State ?? (await factoriesMemory.GetOrCreate(userDataStorage)).State;
    }

    public async Task<UserData<TState>> GetUserData()
    {
        return _detachedState ?? await factoriesMemory.GetOrCreate(userDataStorage);
    }

    public async Task Save()
    {
        if (_detachedState != null)
        {
            throw new InvalidOperationException("State is detached");
        }

        await factoriesMemory.Save(userDataStorage);
    }

    public void InitializeDetached(UserData<TState> state)
    {
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
