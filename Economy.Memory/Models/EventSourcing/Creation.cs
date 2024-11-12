using System.Text.Json.Serialization;
using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Creation(EntityBase Entity, DateTime CreatedOn) : EventBase(CreatedOn)
{
    public override string ToDetails(Containers.State.State state) =>
        $"Created {Entity.GetEntityType()} {Entity.ToDetails(state.CreateHistorySnapshot(GetRevision()))} @{base.ToDetails(state)}";
}