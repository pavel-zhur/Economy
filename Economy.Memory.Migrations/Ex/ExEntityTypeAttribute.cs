namespace Economy.Memory.Migrations.Ex;

internal class ExEntityTypeAttribute(ExEntityType exEntityType) : Attribute
{
    public ExEntityType ExEntityType { get; } = exEntityType;
}