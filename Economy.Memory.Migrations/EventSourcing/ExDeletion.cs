using System.Text.Json.Serialization;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Migrations.EventSourcing;

[method: JsonConstructor]
public record ExDeletion(EntityFullId EntityFullId, DateTime CreatedOn) : ExEventBase(CreatedOn);