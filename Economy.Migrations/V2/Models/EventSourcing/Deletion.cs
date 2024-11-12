using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Models.State;

namespace Economy.Migrations.V2.Models.EventSourcing;

[method: JsonConstructor]
public record Deletion(EntityFullId EntityFullId, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Repositories repositories) =>
        $"Deleted {EntityFullId} @{base.ToDetails(repositories)}";
}