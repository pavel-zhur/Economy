using Economy.Common;

namespace Economy.Engine;

public class FactoriesMemory<TState>
    where TState : class, IState, new()
{
    private readonly Dictionary<string, UserSession> _memory = new();

    public async Task<UserData<TState>> GetOrCreate(IUserDataStorage storage)
    {
        var userKey = storage.GetUserKey();

        UserSession session;
        lock (_memory)
        {
            session = _memory.TryGetValue(userKey, out var value) ? value : _memory[userKey] = new();
        }

        await session.InitializeAsync(storage);

        return session.UserData;
    }

    public async Task Save(IUserDataStorage storage)
    {
        UserSession userSession;
        
        lock (_memory)
        {
            userSession = _memory[storage.GetUserKey()];
        }
        
        await storage.SaveUserData(userSession.UserData.State.SaveToBinary());
    }

    private class UserSession
    {
        private readonly SemaphoreSlim _initializationLock = new(1, 1);
        private bool _initialized;

        public UserData<TState> UserData { get; } = new(new());

        public async Task InitializeAsync(IUserDataStorage storage)
        {
            if (_initialized)
                return;

            await _initializationLock.WaitAsync();
            try
            {
                if (!_initialized)
                {
                    await LoadAsync(storage);
                    _initialized = true;
                }
            }
            finally
            {
                _initializationLock.Release();
            }
        }

        private async Task LoadAsync(IUserDataStorage storage)
        {
            var userData = await storage.GetUserData();

            if (userData != null)
                UserData.State.LoadFromBinary(userData);
        }
    }
}
