using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Models.State.Sub;

public record PlanAmount(
    PlanAmountType Type,
    Amounts Amounts,
    PlanAmountSchedule? ExpectedSchedule,
    Date? ExpectedDate)
{
    public void Validate()
    {
        Amounts.Validate(false, false, true, false);

        ExpectedSchedule?.Validate();

        ExpectedDate?.Validate();

        if (ExpectedSchedule != null && ExpectedDate != null)
        {
            throw new InvalidOperationException("ExpectedSchedule and ExpectedDate may not be set together, one of them should be null");
        }

        if (ExpectedSchedule == null && ExpectedDate == null)
        {
            throw new InvalidOperationException("ExpectedSchedule or ExpectedDate are required if the plan amount is set");
        }
    }

    public string ToDetails(IHistory repositories)
        => $"{Type} {Amounts.ToDetails(repositories)} r:[{ExpectedSchedule?.ToDetails()}{ExpectedDate}]";
}