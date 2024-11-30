using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;
using OneShelf.Common;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Plan)]
[method: JsonConstructor]
public record Plan(
    int Id,
    string Name,
    string? SpecialNotes,
    int? ParentPlanId,
    PlanAmount? Amount)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => ParentPlanId.ToEntityFullId(EntityType.Plan).Once();

    internal override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Plan name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Plan special notes must be null or not empty.");
        }

        if (repositories.Plans.GetParents(this).Any(x => x.Amount?.ExpectedSchedule != null))
        {
            throw new ArgumentException("Plans with schedules may not have children.");
        }

        Amount?.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $" n:({SpecialNotes})")} p:{repositories.GetReferenceTitle(ParentPlanId, EntityType.Plan)} {Amount?.ToDetails(repositories)}";
}