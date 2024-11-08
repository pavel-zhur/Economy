using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase
{
    public abstract string ToDetails(Repositories repositories);
}

public record Creation(EntityBase Entity) : EventBase
{
    public override string ToDetails(Repositories repositories) =>
        $"Created {Entity.GetType().Name} {Entity.ToDetails(repositories)}";
}

public record Update(EntityBase Entity) : EventBase
{
    public override string ToDetails(Repositories repositories) =>
        $"Updated {Entity.GetType().Name} {Entity.ToDetails(repositories)}";
}

public record Deletion(string EntityId) : EventBase
{
    public override string ToDetails(Repositories repositories) =>
        $"Deleted {repositories.GetRepository(EntityId).GetEntityType().Name} {EntityId}";
}