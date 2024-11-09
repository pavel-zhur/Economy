using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Containers.State;

using Repositories;

public class State
{
    public List<EventBase> Events { get; } = new();

    public Repositories Repositories { get; } = new();

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
}