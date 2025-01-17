using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Plan)]
[method: JsonConstructor]
public record Plan(
    int Id,
    string Name,
    string? SpecialNotes,
    int? ParentPlanId,
    PlanExpectedFinancialActivity? ExpectedFinancialActivity)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => (ExpectedFinancialActivity?.GetForeignKeysDirty() ?? []).Append(ParentPlanId.ToEntityFullId(EntityType.Plan));

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

        if (repositories.Plans.GetParents(this).Any(x => x.ExpectedFinancialActivity?.PlannedRecurringDates != null))
        {
            throw new ArgumentException("Plans with activity with recurring dates may not have children.");
        }

        ExpectedFinancialActivity?.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override Details ToDetails()
    => new(GetEntityType())
    {
        ["Id"] = Id,
        ["Name"] = Name,
        ["SpecialNotes"] = SpecialNotes,
        [EntityType.Plan, "Parent Plan"] = ParentPlanId,
        ["ExpectedFinancialActivity"] = ExpectedFinancialActivity?.ToDetails(),
    };
}