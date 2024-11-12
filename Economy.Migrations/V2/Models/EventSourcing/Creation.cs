using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Models.State;

namespace Economy.Migrations.V2.Models.EventSourcing;

[method: JsonConstructor]
public record Creation(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Created {Entity.GetEntityType()} {Entity.ToDetails(repositories)} @{base.ToDetails(repositories)}";
}