using System.Collections.Concurrent;
using System.Text.Json;
using Economy.Memory.Containers.State;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.AiInterface.Scope;

public class FactoriesMemory
{
    private const string FileNameTemplate = "c:/temp/{0}.json";

    private readonly ConcurrentDictionary<string, (State state, ChatHistory chatHistory, Task initialization)> _memory = new();

    public async Task<(State state, ChatHistory chatHistory)> GetOrCreate(string userKey)
    {
        var result = _memory.GetOrAdd(
            userKey,
            _ =>
            {
                var state = new State();
                var initialization = state.LoadFromFile(GetFileName(userKey));
                return (state, new ChatHistory(), initialization);
            });

        await result.initialization;

        return (result.state, result.chatHistory);
    }

    public async Task Save(string userKey)
    {
        await _memory[userKey].state.SaveToFile(GetFileName(userKey));
    }

    private static string GetFileName(string userKey)
    {
        userKey = Path.GetInvalidFileNameChars().Append('.').Aggregate(userKey, (x, c) => x.Replace(c, '_'));

        return string.Format(FileNameTemplate, userKey);
    }
}