using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Models.State;

namespace Economy.Migrations.V2.Models.EventSourcing;

[method: JsonConstructor]
public record Update(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Updated {Entity.GetEntityType()} {Entity.ToDetails(repositories)} @{base.ToDetails(repositories)}";
}