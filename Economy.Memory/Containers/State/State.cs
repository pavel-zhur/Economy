using System.Text;
using System.Text.Json.Serialization;
using Economy.Common;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.State;

using Serialization;
using Repositories;
using System.Text.Json;

public class State : IState
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        Converters =
        {
            new EventBaseConverter(),
            new EntityBaseConverter(),
            new JsonStringEnumConverter(),
        },
        WriteIndented = true
    };

    private readonly Dictionary<EntityFullId, List<EventBase>> _eventsByEntityFullId = new();

    public List<EventBase> Events { get; } = new();

    public Repositories Repositories { get; } = new();

    public IReadOnlyList<EventBase> GetEventsByEntityFullId(EntityFullId entityFullId) => _eventsByEntityFullId[entityFullId];

    public void Apply(EventBase @event)
    {
        switch (@event)
        {
            case Creation creation:
                Repositories
                    .GetRepository(creation.Entity.GetEntityType())
                    .Add(creation.Entity);
                _eventsByEntityFullId[creation.Entity.GetFullId()] = [creation];
                break;
            case Deletion deletion:
                Repositories
                    .GetRepository(deletion.EntityFullId.Type)
                    .Delete(deletion.EntityFullId.Id);
                _eventsByEntityFullId[deletion.EntityFullId].Add(deletion);
                break;
            case Update update:
                Repositories
                    .GetRepository(update.Entity.GetEntityType())
                    .Update(update.Entity);
                _eventsByEntityFullId[update.Entity.GetFullId()].Add(update);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(@event));
        }

        Events.Add(@event);
        @event.SetRevision(Events.Count);
    }

    public byte[] SaveToBinary()
    {
        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new SerializedEvents(3, Events), JsonSerializerOptions));
    }

    public void LoadFromBinary(byte[]? data)
    {
        var events = JsonSerializer.Deserialize<SerializedEvents>(data, JsonSerializerOptions)!;
        if (events.Version != 3)
        {
            throw new ArgumentOutOfRangeException(nameof(events.Version), events.Version, "Expected version 3");
        }

        foreach (var @event in events.Events)
        {
            Apply(@event);
        }
    }

    internal IHistory CreateHistorySnapshot(int revision) => new StateSnapshot(this, revision);
}