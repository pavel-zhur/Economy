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
            chatHistory.AddSystemMessage(@"

- When you call create_or_update_*, pass an empty id if you intend to create a new entity.
- When you call create_or_update_*, pass all fields in case of update as well. The update will be a full replacement.
- When create_or_update_* is executed successfully, the user sees the new or updated entity right away. Do not repeat the entity in the response.
- For date_and_time fields, try to specify realistic the time as well, try to avoid 00:00:00.

");

            var now = DateTime.UtcNow;
            chatHistory.AddSystemMessage(JsonSerializer.Serialize(new
            {
                CurrentDate = new Date(now.Year, now.Month, now.Day),
                CurrentDateAndTime = now,
                Currencies = state.Repositories.Currencies.GetAll(),
                Wallets = state.Repositories.Wallets.GetAll(),
                ActivePlans = state.Repositories.Plans.GetAll(),
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