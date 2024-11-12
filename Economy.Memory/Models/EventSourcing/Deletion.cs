using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Deletion(EntityFullId EntityFullId, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Deleted {EntityFullId} @{base.ToDetails(repositories)}";
}