using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Containers.State;

using Serialization;
using Repositories;
using System.Text.Json;

public class State
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        Converters =
        {
            new EventBaseConverter(),
            new EntityBaseConverter(),
        },
        WriteIndented = true
    };

    public List<EventBase> Events { get; } = new();

    public Repositories Repositories { get; } = new();

    public void Apply(EventBase @event)
    {
        switch (@event)
        {
            case Creation creation:
                Repositories
                    .GetRepository(creation.Entity.GetEntityType())
                    .Add(creation.Entity);
                break;
            case Deletion deletion:
                Repositories
                    .GetRepository(deletion.EntityFullId.Type)
                    .Delete(deletion.EntityFullId.Id);
                break;
            case Update update:
                Repositories
                    .GetRepository(update.Entity.GetEntityType())
                    .Update(update.Entity);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(@event));
        }

        Events.Add(@event);
    }

    public async Task SaveToFile(string filePath)
    {
        await File.WriteAllTextAsync(filePath, JsonSerializer.Serialize(new SerializedEvents(2, Events), JsonSerializerOptions));
    }

    public async Task LoadFromFile(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return;
        }

        var events = JsonSerializer.Deserialize<SerializedEvents>(await File.ReadAllTextAsync(filePath), JsonSerializerOptions);
        foreach (var @event in events!.Events)
        {
            Apply(@event);
        }
    }
}