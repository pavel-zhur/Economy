using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Creation(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Created {Entity.GetEntityType()} {Entity.ToDetails(repositories)} @{base.ToDetails(repositories)}";
}