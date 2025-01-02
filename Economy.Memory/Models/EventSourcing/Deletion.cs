using System.Text.Json.Serialization;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Deletion(EntityFullId EntityFullId, DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision) : EventBase(CreatedOn, Id, ParentId, Revision)
{
    public override string ToDetails(Containers.State.State state) =>
        $"Deleted {EntityFullId.Type} {state.CreateHistorySnapshot(Revision).GetDetails(EntityFullId)} @{base.ToDetails(state)}";
}