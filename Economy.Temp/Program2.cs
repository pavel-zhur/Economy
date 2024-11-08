using System.Reflection;
using System.Text;
using System.Text.Json;
using Economy.Memory.Models.State;
using OpenAI;
using OpenAI.Chat;

namespace Economy.Temp;

class Program2
{
    public static string _apiKey;

    public static async Task Main2(string[] args)
    {
        Console.WriteLine("Welcome to the Financial Model Console App!");

        while (true)
        {
            Console.WriteLine("Enter your command:");
            var input = Console.ReadLine();

            if (string.IsNullOrEmpty(input))
            {
                continue;
            }

            if (input.Equals("exit", StringComparison.OrdinalIgnoreCase))
            {
                break;
            }

            await ProcessInputAsync(input);
        }
    }

    public record SerializedFunctionDefinition(string Name, string? Description, JsonElement Parameters, string EntityType)
    {
        public Type EntityTypeFound => typeof(EntityBase).Assembly.GetTypes().Where(x => x.IsSubclassOf(typeof(EntityBase))).Single(x => x.Name == EntityType);
    }

    private static async Task ProcessInputAsync(string input)
    {
        List<ChatMessage> messages = [
            ChatMessage.CreateSystemMessage("Assist the user to do financial operations with his account."),
            ChatMessage.CreateUserMessage(input), 
        ];

        ChatCompletionOptions options = new();

        var schema = GetSchema();

        foreach (var serializedFunctionDefinition in schema)
        {
            options.Tools.Add(ChatTool.CreateFunctionTool(
                serializedFunctionDefinition.Name,
                serializedFunctionDefinition.Description,
                BinaryData.FromBytes(Encoding.UTF8.GetBytes(serializedFunctionDefinition.Parameters.ToString()))));
        }

        while (true)
        {
            var response = await new OpenAIClient(_apiKey).GetChatClient("gpt-4o-mini").CompleteChatAsync(messages, options);
            messages.Add(ChatMessage.CreateAssistantMessage(response));

            foreach (var toolCall in response.Value.ToolCalls)
            {
                Console.WriteLine(JsonSerializer.Serialize(toolCall));

                var entityBase = (EntityBase)JsonSerializer.Deserialize(toolCall.FunctionArguments,
                    schema.Single(x => x.Name == toolCall.FunctionName).EntityTypeFound,
                    new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower })!;

                Console.WriteLine(JsonSerializer.Serialize<object>(entityBase));

                messages.Add(ChatMessage.CreateToolMessage(toolCall.Id,
                    string.IsNullOrEmpty(entityBase.Id) ? """ {"result":"success", "id":35} """ : """{"result":"success"}"""));
            }

            switch (response.Value.FinishReason)
            {
                case ChatFinishReason.ToolCalls when !response.Value.Content.Any():
                    continue;
                case ChatFinishReason.Stop when response.Value.Content.Single().Kind == ChatMessageContentPartKind.Text:
                    Console.WriteLine(response.Value.Content.Single().Text);
                    messages.Add(ChatMessage.CreateUserMessage(Console.ReadLine()));
                    break;
                default:
                    Console.WriteLine("Not supported.");
                    Console.WriteLine(JsonSerializer.Serialize(response.Value));
                    return;
            }
        }
    }

    private static List<SerializedFunctionDefinition> GetSchema()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("Economy.Temp.tools.json");
        using var reader = new StreamReader(stream);
        var schema = reader.ReadToEnd();
        return JsonSerializer.Deserialize<List<SerializedFunctionDefinition>>(schema, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        })!;
    }

}