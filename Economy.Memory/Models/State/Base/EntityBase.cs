﻿using System.Reflection;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Base;

public abstract record EntityBase(int Id)
{
    internal IEnumerable<EntityFullId> GetForeignKeys() =>
        GetForeignKeysDirty().Where(x => x.HasValue).Select(x => x!.Value).Distinct();

    protected virtual IEnumerable<EntityFullId?> GetForeignKeysDirty() => Enumerable.Empty<EntityFullId?>();

    internal abstract void Validate(Repositories repositories);

    public abstract Details ToDetails();

    public EntityType GetEntityType() => GetType().GetCustomAttribute<EntityTypeAttribute>()!.EntityType;

    public EntityFullId GetFullId() => new(GetEntityType(), Id);
}
