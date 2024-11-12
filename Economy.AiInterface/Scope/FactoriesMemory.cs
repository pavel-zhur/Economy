using System.Collections.Concurrent;
using System.Text.Json;
using Economy.AiInterface.StateManagement;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.AiInterface.Scope;

public class FactoriesMemory
{
    private const string FileNameTemplate = "c:/temp/{0}.json";

    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        Converters =
        {
            new EventBaseConverter(),
            new EntityBaseConverter(),
        },
        WriteIndented = true
    };

    private readonly ConcurrentDictionary<string, (State state, ChatHistory chatHistory, Task initialization)> _memory = new();

    public async Task<(State state, ChatHistory chatHistory)> GetOrCreate(string userKey)
    {
        var result = _memory.GetOrAdd(
            userKey,
            _ =>
            {
                var state = new State();
                var initialization = LoadFromFile(state, userKey);
                return (state, new ChatHistory(), initialization);
            });

        await result.initialization;

        return (result.state, result.chatHistory);
    }

    public async Task Save(string userKey)
    {
        await SaveToFile(_memory[userKey].state, userKey);
    }

    private static async Task SaveToFile(State state, string userKey)
    {
        await File.WriteAllTextAsync(GetFileName(userKey), JsonSerializer.Serialize(new SerializedEvents(2, state.Events), JsonSerializerOptions));
    }

    private static string GetFileName(string userKey)
    {
        userKey = Path.GetInvalidFileNameChars().Append('.').Aggregate(userKey, (x, c) => x.Replace(c, '_'));

        return string.Format(FileNameTemplate, userKey);
    }

    private static async Task LoadFromFile(State state, string userKey)
    {
        var fileName = GetFileName(userKey);
        if (!File.Exists(fileName))
        {
            return;
        }

        var events = JsonSerializer.Deserialize<SerializedEvents>(await File.ReadAllTextAsync(fileName), JsonSerializerOptions);
        foreach (var @event in events!.Events)
        {
            state.Apply(@event);
        }
    }

    private record SerializedEvents(int Version, List<EventBase> Events);
}