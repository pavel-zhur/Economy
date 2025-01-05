using Economy.Common;
using Economy.Engine.Models.Internal;

namespace Economy.Engine.Services.Implementation;

internal class StateFactoryMemory<TState>(IMigrator<TState> migrator)
    where TState : class, IState
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

        await session.InitializeAsync(migrator, storage);

        return session.UserData;
    }

    public async Task Save(IUserDataStorage storage)
    {
        UserSession userSession;

        lock (_memory)
        {
            userSession = _memory[storage.GetUserKey()];
        }

        await storage.SaveUserData(migrator.SaveToBinary(userSession.UserData.State));
    }

    private class UserSession
    {
        private readonly SemaphoreSlim _initializationLock = new(1, 1);
        private bool _initialized;

        public UserData<TState> UserData { get; private set; }

        public async Task InitializeAsync(IMigrator<TState> migrator, IUserDataStorage storage)
        {
            if (_initialized)
                return;

            await _initializationLock.WaitAsync();
            try
            {
                if (!_initialized)
                {
                    await LoadAsync(migrator, storage);
                    _initialized = true;
                }
            }
            finally
            {
                _initializationLock.Release();
            }
        }

        private async Task LoadAsync(IMigrator<TState> migrator, IUserDataStorage storage)
        {
            var userData = await storage.GetUserData();

            UserData = new(userData != null
                ? migrator.LoadFromBinary(userData)
                : migrator.CreateEmpty());
        }
    }
}
