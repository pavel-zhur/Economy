namespace Economy.Memory.Models.State.Sub;

public readonly record struct Period(Date StartDate, Date FinishDate)
{
    public void Validate()
    {
        StartDate.Validate();
        FinishDate.Validate();

        if (StartDate >= FinishDate)
        {
            throw new ArgumentException("Period start date must be before finish date.");
        }
    }

    public string ToDetails() => $"[{StartDate} - {FinishDate}]";
}