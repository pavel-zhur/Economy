using System.Text.Json.Serialization;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Creation(EntityBase Entity, DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision) : EventBase(CreatedOn, Id, ParentId, Revision)
{
    public override string ToDetails(Containers.State.State state) =>
        $"Created {Entity.GetEntityType()} {Entity.ToDetails().ToString(state.CreateHistorySnapshot(Revision))} @{base.ToDetails(state)}";
}