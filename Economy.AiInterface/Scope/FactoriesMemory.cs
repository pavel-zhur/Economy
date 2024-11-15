using Economy.Memory.Containers.State;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.AiInterface.Scope;

public class FactoriesMemory
{
    private readonly Dictionary<string, UserSession> _memory = new();

    public async Task<(State state, ChatHistory chatHistory)> GetOrCreate(IUserDataStorage storage)
    {
        var userKey = storage.GetUserKey();

        UserSession session;
        lock (_memory)
        {
            session = _memory.TryGetValue(userKey, out var value) ? value : _memory[userKey] = new();
        }

        await session.InitializeAsync(storage);

        return (session.State, session.ChatHistory);
    }

    public async Task Save(IUserDataStorage storage)
    {
        UserSession userSession;
        
        lock (_memory)
        {
            userSession = _memory[storage.GetUserKey()];
        }
        
        await storage.SaveUserData(userSession.State.SaveToBinary());
    }

    private class UserSession
    {
        private readonly SemaphoreSlim _initializationLock = new(1, 1);
        private bool _initialized;

        public State State { get; } = new();
        public ChatHistory ChatHistory { get; } = new();

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
                State.LoadFromBinary(userData);
        }
    }
}
