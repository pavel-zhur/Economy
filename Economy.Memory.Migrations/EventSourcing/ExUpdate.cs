using System.Text.Json.Serialization;

namespace Economy.Memory.Migrations.EventSourcing;

[method: JsonConstructor]
public record ExUpdate(ExEntity Entity, DateTime CreatedOn) : ExEventBase(CreatedOn);