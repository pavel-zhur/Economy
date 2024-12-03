using Economy.Memory.Models.State.Enums;

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

    public string ToDetails() => $"[{Interval} {Behavior} {Period.ToDetails()}]";
}