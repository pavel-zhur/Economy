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
            throw new ArgumentException("Plan amount schedule and date must not be set together.");
        }

        if (Type == PlanAmountType.Reserve && (ExpectedSchedule != null || ExpectedDate != null))
        {
            throw new ArgumentException("Reserve plan amount cannot have schedule or date.");
        }
    }

    public string ToDetails(IHistory repositories)
        => $"{Type} {Amounts.ToDetails(repositories)} r:[{ExpectedSchedule?.ToDetails()}{ExpectedDate}]";
}