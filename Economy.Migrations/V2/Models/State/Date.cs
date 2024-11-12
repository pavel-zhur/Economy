using System.Text.Json.Serialization;

namespace Economy.Migrations.V2.Models.State;

[method: JsonConstructor]
public record struct Date(int Year, int Month, int Day) : IComparable<Date>
{
    public void Validate()
    {
        _ = new DateTime(Year, Month, Day);
    }

    public static bool operator <(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) < new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) > new DateTime(right.Year, right.Month, right.Day);
    public static bool operator <=(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) <= new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >=(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) >= new DateTime(right.Year, right.Month, right.Day);

    public override string ToString()
        => $"{Day:D2}.{Month:D2}.{Year}";

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