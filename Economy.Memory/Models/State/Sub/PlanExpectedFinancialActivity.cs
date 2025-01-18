using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Sub;

public record PlanExpectedFinancialActivity(
    PlanExpectedFinancialActivityType Type,
    Amounts Amounts,
    PlanExpectedFinancialActivityRecurringDates? PlannedRecurringDates,
    Date? PlannedDate)
{
    public void Validate()
    {
        Amounts.Validate(false, false, true, false);

        PlannedRecurringDates?.Validate();

        PlannedDate?.Validate();

        if (PlannedRecurringDates != null && PlannedDate != null)
        {
            throw new InvalidOperationException("Planned recurring dates and planned date of an expected financial activity may not be set together, one of them should be null");
        }

        if (PlannedRecurringDates == null && PlannedDate == null)
        {
            throw new InvalidOperationException("Planned recurring dates or planned date is required in the expected financial activity if it is set for the plan.");
        }
    }

    public Details ToDetails()
        => new()
        {
            ["Type"] = Type,
            ["Amounts"] = Amounts.ToDetails(),
            ["PlannedRecurringDates"] = PlannedRecurringDates?.ToDetails(),
            ["PlannedDate"] = PlannedDate?.ToString(),
        };

    public IEnumerable<EntityFullId?> GetForeignKeysDirty()
        => Amounts.GetForeignKeysDirty();
}