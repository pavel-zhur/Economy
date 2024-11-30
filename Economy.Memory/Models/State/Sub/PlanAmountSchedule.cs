using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Models.State.Sub;

public record PlanAmountSchedule(
    Period Period, 
    ScheduleInterval Interval,
    ScheduleBehavior Behavior)
{
    public void Validate()
    {
        Period.Validate();
    }

    public string ToDetails() => $"[{Interval} {Behavior} {Period.ToDetails()}]";
}