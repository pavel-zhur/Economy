﻿using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;
using OneShelf.Common;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Event)]
[method: JsonConstructor]
public record Event(int Id, string Name, string? SpecialNotes, int? PlanId, Date Date) : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => PlanId.ToEntityFullId(EntityType.Plan).Once();

    internal override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Event name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Event special notes must be null or not empty.");
        }

        Date.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {Name} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {Date}{(SpecialNotes == null ? null : $" n:({SpecialNotes})")}";
}