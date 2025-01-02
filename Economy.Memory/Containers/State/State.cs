using Economy.Common;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Containers.State;

using Repositories;

public class State : IState
{
    private readonly Dictionary<EntityFullId, List<EventBase>> _eventsByEntityFullId = new();
    private readonly List<EventBase> _events = new();

    public IReadOnlyList<EventBase> Events => _events;

    public Repositories Repositories { get; } = new();

    public string UniqueIdentifier => Events.Count.ToString();

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

        _events.Add(@event);
    }

    public (Guid? parentId, int revision) GetNextEventParentIdAndRevision()
    {
        return (parentId: Events.Any() ? Events[^1].Id : null, revision: Events.Count + 1);
    }

    internal IHistory CreateHistorySnapshot(int revision) => new StateSnapshot(this, revision);
}