using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Tools;
using OneShelf.Common;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Event)]
[method: JsonConstructor]
public record Event(int Id, string Name, string? SpecialNotes, int? PlanId, Date Date) : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => PlanId.ToEntityFullId(EntityType.Plan).Once();

    public override void Validate(Repositories repositories)
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

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {Date}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")}";
}