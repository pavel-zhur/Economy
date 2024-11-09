using Economy.Memory.Models.State;

namespace Economy.Memory.Models;

public class EntityTypeAttribute(EntityType entityType) : Attribute
{
    public EntityType EntityType { get; } = entityType;
}