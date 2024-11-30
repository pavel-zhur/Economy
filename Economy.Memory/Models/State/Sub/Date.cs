using System.Text.Json.Serialization;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Sub;

[method: JsonConstructor]
public readonly record struct Date(int Year, int Month, int Day) : IComparable<Date>, IComparable
{
    public void Validate()
    {
        this.ToDateTime().Validate();
    }

    public static bool operator <(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) < new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) > new DateTime(right.Year, right.Month, right.Day);
    public static bool operator <=(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) <= new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >=(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) >= new DateTime(right.Year, right.Month, right.Day);

    public override string ToString()
        => $"{Day:D2}.{Month:D2}.{Year}";

    public int CompareTo(object? obj)
    {
        if (obj is null) return 1;
        if (obj is Date date) return CompareTo(date);
        throw new ArgumentException($"Object must be of type {nameof(Date)}.");
    }

    [JsonIgnore]
    public IComparable OppositeComparable => new Date(-Year, -Month, -Day);

    public Date AddDays(int i)
    {
        var dateTime = new DateTime(Year, Month, Day).AddDays(i);
        return new Date(dateTime.Year, dateTime.Month, dateTime.Day);
    }

    public int CompareTo(Date other)
    {
        var yearComparison = Year.CompareTo(other.Year);
        if (yearComparison != 0) return yearComparison;
        var monthComparison = Month.CompareTo(other.Month);
        if (monthComparison != 0) return monthComparison;
        return Day.CompareTo(other.Day);
    }
}