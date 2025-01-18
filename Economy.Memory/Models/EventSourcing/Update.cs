using System.Text.Json.Serialization;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.EventSourcing;

[method: JsonConstructor]
public record Update(EntityBase Entity, DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision) : EventBase(CreatedOn, Id, ParentId, Revision)
{
    public override Details ToDetails()
    {
        var details = base.ToDetails();
        details["Entity"] = Entity.ToDetails();

        return details;
    }

    public override EventType EventType => EventType.Update;
}