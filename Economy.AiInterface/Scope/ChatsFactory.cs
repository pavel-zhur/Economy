using Economy.AiInterface.StateManagement;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel;
namespace Economy.AiInterface.Scope;

public class ChatsFactory(FactoriesMemory factoriesMemory, IStateUserGetter stateUserGetter, Kernel kernel, IChatCompletionService chatCompletionService)
{
    public async Task<Chat> Get()
    {
        var (state, chatHistory) = await factoriesMemory.GetOrCreate(stateUserGetter.GetStateUserKey());
        return new(chatHistory, kernel, chatCompletionService, state);
    }
}