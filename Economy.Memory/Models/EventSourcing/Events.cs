using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase
{
    public abstract string ToLongString(Repositories repositories);

    public abstract string ToShortString(Repositories repositories);
}

public record Creation(EntityBase Entity) : EventBase
{
    public override string ToShortString(Repositories repositories) =>
        $"Created {Entity.ToShortString(repositories)}";

    public override string ToLongString(Repositories repositories) =>
        $"Created {Entity.ToLongString(repositories)}";
}

public record Update(EntityBase Entity) : EventBase
{
    public override string ToShortString(Repositories repositories) =>
        $"Updated {Entity.ToShortString(repositories)}";

    public override string ToLongString(Repositories repositories) =>
        $"Updated {Entity.ToLongString(repositories)}";
}

public record Deletion(string EntityId) : EventBase
{
    public override string ToShortString(Repositories repositories) =>
       $"Deleted {EntityId}";

    public override string ToLongString(Repositories repositories) =>
        $"Deleted {EntityId}";
}