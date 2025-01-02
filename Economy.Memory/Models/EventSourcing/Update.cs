using System.Text.Json.Serialization;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Update(EntityBase Entity, DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision) : EventBase(CreatedOn, Id, ParentId, Revision)
{
    public override string ToDetails(Containers.State.State state) =>
        $"Updated {Entity.GetEntityType()} {Entity.ToDetails(state.CreateHistorySnapshot(Revision))} @{base.ToDetails(state)}";
}