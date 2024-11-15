using Economy.AiInterface.StateManagement;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel;
namespace Economy.AiInterface.Scope;

public class ChatsFactory(FactoriesMemory factoriesMemory, IUserDataStorage userDataStorage, Kernel kernel, IChatCompletionService chatCompletionService)
{
    public async Task<Chat> Get()
    {
        var (state, chatHistory) = await factoriesMemory.GetOrCreate(userDataStorage);
        return new(chatHistory, kernel, chatCompletionService, state);
    }
}