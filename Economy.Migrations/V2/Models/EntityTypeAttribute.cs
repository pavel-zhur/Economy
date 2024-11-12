using Economy.Migrations.V2.Models.State;

namespace Economy.Migrations.V2.Models;

public class EntityTypeAttribute(EntityType entityType) : Attribute
{
    public EntityType EntityType { get; } = entityType;
}