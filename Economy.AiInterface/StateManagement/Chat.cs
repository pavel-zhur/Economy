using System.Runtime.CompilerServices;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace Economy.AiInterface.StateManagement;

public class Chat(Kernel kernel, IChatCompletionService chatCompletionService)
{
    private readonly OpenAIPromptExecutionSettings _openAiPromptExecutionSettings = new()
    {
        FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
    };

    private readonly ChatHistory _history = new();

    public async Task<string> Go(string userInput)
    {
        // Add user input
        _history.AddUserMessage(userInput);

        // Get the response from the AI
        var result = await chatCompletionService.GetChatMessageContentAsync(
            _history,
            executionSettings: _openAiPromptExecutionSettings,
            kernel: kernel);

        // Add the message from the agent to the chat history
        _history.AddMessage(result.Role, result.Content ?? string.Empty);

        return result.ToString();
    }
}