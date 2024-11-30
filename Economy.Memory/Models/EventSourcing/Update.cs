using System.Text.Json.Serialization;
using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Update(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Containers.State.State state) =>
        $"Updated {Entity.GetEntityType()} {Entity.ToDetails(state.CreateHistorySnapshot(GetRevision()))} @{base.ToDetails(state)}";
}