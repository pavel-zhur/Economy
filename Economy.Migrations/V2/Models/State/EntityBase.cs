using System.Reflection;
using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.State;

// todo: extract to files
public abstract record EntityBase(int Id)
{
    public IEnumerable<EntityFullId> GetForeignKeys() => GetForeignKeysDirty().Where(x => x.HasValue).Select(x => x!.Value).Distinct();

    protected virtual IEnumerable<EntityFullId?> GetForeignKeysDirty() => Enumerable.Empty<EntityFullId?>();

    public abstract void Validate(Repositories repositories);

    public abstract string ToReferenceTitle();

    public abstract string ToDetails(Repositories repositories);

    public EntityType GetEntityType() => GetType().GetCustomAttribute<EntityTypeAttribute>()!.EntityType;

    public EntityFullId GetFullId() => new(GetEntityType(), Id);
}

// Root entities

// Sub-entities

// Value objects