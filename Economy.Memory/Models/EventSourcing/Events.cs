using System.Globalization;
using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase(DateTime CreatedOn)
{
    public virtual string ToDetails(Repositories repositories) => CreatedOn.ToString(CultureInfo.InvariantCulture);
}

[method: JsonConstructor]
public record Creation(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Created {Entity.GetType().Name} {Entity.ToDetails(repositories)} @{base.ToDetails(repositories)}";
}

[method: JsonConstructor]
public record Update(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Updated {Entity.GetType().Name} {Entity.ToDetails(repositories)} @{{base.ToDetails(repositories)}}";
}

[method: JsonConstructor]
public record Deletion(string EntityId, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Deleted {repositories.GetRepository(EntityId).GetEntityType().Name} {EntityId} @{{base.ToDetails(repositories)}}";
}