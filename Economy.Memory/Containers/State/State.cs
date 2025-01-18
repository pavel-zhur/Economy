using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Base;
using OneShelf.Common;

namespace Economy.Memory.Containers.State;

using Repositories;

public class State
{
    private readonly Dictionary<EntityFullId, List<EventBase>> _eventsByEntityFullId = new();
    private readonly List<EventBase> _events = new();

    public State()
    {
        Repositories = new(this);
    }

    public IReadOnlyList<EventBase> Events => _events;

    public Repositories Repositories { get; }

    public IReadOnlyList<EventBase> GetEventsByEntityFullId(EntityFullId entityFullId) => _eventsByEntityFullId[entityFullId];

    internal void Apply(EventBase @event)
    {
        var (parentId, revision) = GetNextEventParentIdAndRevision();
        if (@event.ParentId != parentId || @event.Revision != revision)
        {
            throw new InvalidOperationException($"Invalid event: expected parent id {parentId} and revision {revision}, but got {@event.ParentId} and {@event.Revision}.");
        }

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

    internal void AddFromWithoutValidation(State another)
    {
        if (_events.Any() || _events.Any() || Repositories.AllByEntityType.Values.Any(x => x.GetAll().Any()))
        {
            throw new InvalidOperationException("State is not empty.");
        }

        _events.AddRange(another._events);
        _eventsByEntityFullId.AddRange(another._eventsByEntityFullId.Select(x => (x.Key, x.Value.ToList())), false);
        Repositories.AddFromWithoutValidation(another.Repositories);
    }
}