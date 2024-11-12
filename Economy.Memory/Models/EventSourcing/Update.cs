using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Update(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Updated {Entity.GetEntityType()} {Entity.ToDetails(repositories)} @{base.ToDetails(repositories)}";
}