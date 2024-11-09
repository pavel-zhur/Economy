using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase
{
    public abstract string ToDetails(Repositories repositories);
}

[method: JsonConstructor]
public record Creation(EntityBase Entity) : EventBase
{
    public override string ToDetails(Repositories repositories) =>
        $"Created {Entity.GetType().Name} {Entity.ToDetails(repositories)}";
}

[method: JsonConstructor]
public record Update(EntityBase Entity) : EventBase
{
    public override string ToDetails(Repositories repositories) =>
        $"Updated {Entity.GetType().Name} {Entity.ToDetails(repositories)}";
}

[method: JsonConstructor]
public record Deletion(string EntityId) : EventBase
{
    public override string ToDetails(Repositories repositories) =>
        $"Deleted {repositories.GetRepository(EntityId).GetEntityType().Name} {EntityId}";
}