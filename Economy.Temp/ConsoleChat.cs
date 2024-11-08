using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace Economy.Temp;

public class ConsoleChat(Kernel kernel)
{
    public async Task Main2()
    {
        Console.WriteLine("Welcome to the Financial Model Console App!");

        var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

        // Enable planning
        OpenAIPromptExecutionSettings openAIPromptExecutionSettings = new OpenAIPromptExecutionSettings
        {
            FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
            
        };

        // Create a history store the conversation
        var history = new ChatHistory();

        // Initiate a back-and-forth chat
        string? userInput;
        do
        {
            // Collect user input
            Console.Write("User > ");
            userInput = Console.ReadLine();

            // Add user input
            history.AddUserMessage(userInput);

            // Get the response from the AI
            var result = await chatCompletionService.GetChatMessageContentAsync(
                history,
                executionSettings: openAIPromptExecutionSettings,
                kernel: kernel);

            // Print the results
            Console.WriteLine("Assistant > " + result);

            // Add the message from the agent to the chat history
            history.AddMessage(result.Role, result.Content ?? string.Empty);
        } while (userInput is not null);
    }
}