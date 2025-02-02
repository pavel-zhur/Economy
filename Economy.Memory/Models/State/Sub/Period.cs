﻿namespace Economy.Memory.Models.State.Sub;

public readonly record struct Period(Date StartDate, Date EndDate)
{
    public void Validate()
    {
        StartDate.Validate();
        EndDate.Validate();

        if (StartDate >= EndDate)
        {
            throw new ArgumentException("Period start date must be before end date.");
        }
    }

    public string ToDetails() => $"[{StartDate} - {EndDate}]";
}