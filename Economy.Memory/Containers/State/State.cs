﻿using Economy.Common;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Containers.State;

using Repositories;

public class State : IState
{
    private readonly Dictionary<EntityFullId, List<EventBase>> _eventsByEntityFullId = new();

    public List<EventBase> Events { get; } = new();

    public Repositories Repositories { get; } = new();

    public int LatestRevision => Events.Count;

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

    internal IHistory CreateHistorySnapshot(int revision) => new StateSnapshot(this, revision);
}