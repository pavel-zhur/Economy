using System.Text.Json;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace Economy.AiInterface.StateManagement;

public class Chat(ChatHistory chatHistory, Kernel kernel, IChatCompletionService chatCompletionService, State state)
{
    private readonly OpenAIPromptExecutionSettings _openAiPromptExecutionSettings = new()
    {
        FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
    };

    public async Task<string> Go(string userInput)
    {
        if (!chatHistory.Any())
        {
            var now = DateTime.UtcNow;
            chatHistory.AddSystemMessage(JsonSerializer.Serialize(new
            {
                CurrentDate = new Date(now.Year, now.Month, now.Day),
                CurrentDateTime = now,
                Currencies = state.Repositories.Currencies.GetAll(),
                Wallets = state.Repositories.Wallets.GetAll(),
                ActiveBudgets = state.Repositories.Budgets.GetAll(),
                Categories = state.Repositories.Categories.GetAll(),
            }, ServiceCollectionExtensions.JsonSerializerOptions));
        }

        // Add user input
        chatHistory.AddUserMessage(userInput);

        // Get the response from the AI
        var result = await chatCompletionService.GetChatMessageContentAsync(
            chatHistory,
            executionSettings: _openAiPromptExecutionSettings,
            kernel: kernel);

        // Add the message from the agent to the chat history
        chatHistory.AddMessage(result.Role, result.Content ?? string.Empty);

        return result.ToString();
    }
}