using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using System.Text.Json;

namespace Economy.AiInterface.Services;

public class AiCompletion(Kernel kernel, IChatCompletionService chatCompletionService)
{
    private readonly OpenAIPromptExecutionSettings _openAiPromptExecutionSettings = new()
    {
        FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
    };

    public void AddSystemMessage(ChatHistory chatHistory, string message)
    {
        chatHistory.AddSystemMessage(message);
    }

    public void AddSystemMessage(ChatHistory chatHistory, object message)
    {
        chatHistory.AddSystemMessage(JsonSerializer.Serialize(message, ServiceCollectionExtensions.JsonSerializerOptions));
    }

    public async Task<string> Execute(ChatHistory chatHistory, string userInput)
    {
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