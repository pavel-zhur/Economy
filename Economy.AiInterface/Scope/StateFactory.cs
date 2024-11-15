using Economy.Memory.Containers.State;

namespace Economy.AiInterface.Scope;

public class StateFactory(FactoriesMemory factoriesMemory, IUserDataStorage userDataStorage)
{
    public async Task<State> Get()
    {
        var (state, _) = await factoriesMemory.GetOrCreate(userDataStorage);
        return state;
    }

    public async Task Save()
    {
        await factoriesMemory.Save(userDataStorage);
    }
}