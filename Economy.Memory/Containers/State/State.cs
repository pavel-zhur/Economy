using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Containers.State;

using Repositories;

public class State
{
    public List<EventBase> Events { get; } = new();

    public Repositories Repositories { get; } = new();

    public async Task Apply(EventBase @event)
    {
        switch (@event)
        {
            case Creation creation:
                await Repositories
                    .AllRepositories[creation.Entity.Id[..creation.Entity.Id.IndexOf("-", StringComparison.Ordinal)]]
                    .Add(creation.Entity);
                break;
            case Deletion deletion:
                await Repositories
                    .AllRepositories[deletion.EntityId[..deletion.EntityId.IndexOf("-", StringComparison.Ordinal)]]
                    .Delete(deletion.EntityId);
                break;
            case Update update:
                await Repositories
                    .AllRepositories[update.Entity.Id[..update.Entity.Id.IndexOf("-", StringComparison.Ordinal)]]
                    .Update(update.Entity);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(@event));
        }

        Events.Add(@event);
    }
}