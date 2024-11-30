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
    PlanSchedule? Schedule,
    Amounts? ExpectedIncome,
    Amounts? ExpectedExpense,
    Date? ExpectedDate)
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

        Schedule?.Validate();

        if (repositories.Plans.GetParents(this).Any(x => x.Schedule != null))
        {
            throw new ArgumentException("Plans with schedules may not have children.");
        }

        ExpectedIncome?.Validate(false, false, true, false);
        ExpectedExpense?.Validate(false, false, true, false);
        ExpectedDate?.Validate();

        if (ExpectedIncome != null && ExpectedExpense != null)
        {
            throw new ArgumentException("Income and expense may not be set together.");
        }

        if (Schedule != null && ExpectedIncome == null && ExpectedExpense == null)
        {
            throw new ArgumentException("If schedule is set, income or expense should be set, as well.");
        }

        if (ExpectedDate != null && ExpectedIncome == null && ExpectedExpense == null)
        {
            throw new ArgumentException("If expected date is set, income or expense should be set, as well.");
        }

        if (ExpectedDate != null && Schedule != null)
        {
            throw new ArgumentException("Expected date and schedule may not be set together.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public string ToExpectedDetails(IHistory repositories)
        => string.Join(", ",
            new[]
            {
                ExpectedIncome != null ? "inc" : null,
                ExpectedExpense != null ? "exp" : null,
                ExpectedIncome?.ToDetails(repositories),
                ExpectedExpense?.ToDetails(repositories),
                ExpectedDate?.ToString()
            }.Where(x => x != null));

    public override string ToDetails(IHistory repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $" n:({SpecialNotes})")} p:{repositories.GetReferenceTitle(ParentPlanId, EntityType.Plan)} {Schedule?.ToDetails()} ei:{ExpectedIncome?.ToDetails(repositories)} ee:{ExpectedExpense?.ToDetails(repositories)} ed:{ExpectedDate}";
}