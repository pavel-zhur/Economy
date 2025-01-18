using Economy.Memory.Models.State.Enums;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Sub;

public record PlanExpectedFinancialActivityRecurringDates(
    Period Period, 
    RecurringInterval Interval,
    RecurringAmountsBalancingBehavior Behavior)
{
    public void Validate()
    {
        Period.Validate();
    }

    public Details ToDetails()
        => new()
        {
            ["Period"] = Period.ToDetails(),
            ["Interval"] = Interval,
            ["Behavior"] = Behavior,
        };
}