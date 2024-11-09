using System.Text.Json;
using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Containers.State;

using Repositories;

public class State
{
    private readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions
    {
        Converters =
        {
            new EventBaseConverter(),
            new EntityBaseConverter(),
        },
        WriteIndented = true
    };

    [Obsolete]
    private const string FileName = "c:/temp/state.json";

    public List<EventBase> Events { get; } = new();

    // todo: remove the private setter
    public Repositories Repositories { get; private set; } = new();

    public void Apply(EventBase @event)
    {
        switch (@event)
        {
            case Creation creation:
                Repositories
                    .GetRepository(creation.Entity.Id)
                    .Add(creation.Entity);
                break;
            case Deletion deletion:
                Repositories
                    .GetRepository(deletion.EntityId)
                    .Delete(deletion.EntityId);
                break;
            case Update update:
                Repositories
                    .GetRepository(update.Entity.Id)
                    .Update(update.Entity);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(@event));
        }

        Events.Add(@event);
    }

    [Obsolete]
    public async Task SaveToFile()
    {
        await File.WriteAllTextAsync(FileName, JsonSerializer.Serialize(Events, _jsonSerializerOptions));
    }

    [Obsolete]
    public async Task LoadFromFile()
    {
        if (!File.Exists(FileName))
        {
            return;
        }

        var events = JsonSerializer.Deserialize<List<EventBase>>(await File.ReadAllTextAsync(FileName), _jsonSerializerOptions);
        Events.Clear();
        Repositories = new();
        foreach (var @event in events!)
        {
            Apply(@event);
        }
    }

}