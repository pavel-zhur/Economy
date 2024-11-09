using Economy.Memory.Containers.State;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.AiInterface.Scope;

public class StateFactory(FactoriesMemory factoriesMemory, IStateUserGetter stateUserGetter, IServiceProvider serviceProvider)
{
    public async Task<State> Get()
    {
        var kernel = serviceProvider.GetRequiredService<Kernel>();
        var chatCompletionService = serviceProvider.GetRequiredService<IChatCompletionService>();
        var (state, _) = await factoriesMemory.GetOrCreate(stateUserGetter.GetStateUserKey(), kernel, chatCompletionService);
        return state;
    }

    public async Task Save()
    {
        await factoriesMemory.Save(stateUserGetter.GetStateUserKey());
    }
}