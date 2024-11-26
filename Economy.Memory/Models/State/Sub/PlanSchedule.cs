using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Models.State.Sub;

public record PlanSchedule(Date StartDate, Date FinishDate, Schedule Schedule, Amounts Amounts)
{
    public void Validate()
    {
        StartDate.Validate();
        FinishDate.Validate();

        if (StartDate > FinishDate)
        {
            throw new ArgumentException("Plan schedule start date must be before finish date.");
        }

        Amounts.Validate(false, false, true, false);
    }

    public string ToDetails() => $"[{Schedule} {StartDate} - {FinishDate}]";
}