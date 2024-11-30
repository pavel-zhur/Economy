using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Models.State.Sub;

public record PlanSchedule(
    Period Period, 
    Schedule Schedule)
{
    public void Validate()
    {
        Period.Validate();
    }

    public string ToDetails() => $"[{Schedule} {Period.ToDetails()}]";
}