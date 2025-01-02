using System.Text.Json.Serialization;

namespace Economy.Memory.Migrations.EventSourcing;

[method: JsonConstructor]
public record ExUpdate(ExEntity Entity, DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision) : ExEventBase(CreatedOn, Id, ParentId, Revision);