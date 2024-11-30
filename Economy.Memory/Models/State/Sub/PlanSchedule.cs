using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Models.State.Sub;

public record PlanSchedule(
    Period Period, 
    ScheduleType Type,
    ScheduleBehavior Behavior)
{
    public void Validate()
    {
        Period.Validate();
    }

    public string ToDetails() => $"[{Type} {Behavior} {Period.ToDetails()}]";
}