using Economy.AiInterface.Scope;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace Economy.AiInterface.StateManagement;

public class Chat(ChatHistory chatHistory, Kernel kernel, IChatCompletionService chatCompletionService)
{
    private readonly OpenAIPromptExecutionSettings _openAiPromptExecutionSettings = new()
    {
        FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
    };

    public async Task<string> Go(string userInput)
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