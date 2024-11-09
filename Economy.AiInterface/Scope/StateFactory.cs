using Economy.Memory.Containers.State;

namespace Economy.AiInterface.Scope;

public class StateFactory(FactoriesMemory factoriesMemory, IStateUserGetter stateUserGetter)
{
    public async Task<State> Get()
    {
        var (state, _) = await factoriesMemory.GetOrCreate(stateUserGetter.GetStateUserKey());
        return state;
    }

    public async Task Save()
    {
        await factoriesMemory.Save(stateUserGetter.GetStateUserKey());
    }
}