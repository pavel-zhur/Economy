using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Models;

public class EntityTypeAttribute(EntityType entityType) : Attribute
{
    public EntityType EntityType { get; } = entityType;
}