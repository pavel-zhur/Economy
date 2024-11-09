using Economy.Memory.Models.State;

namespace Economy.Memory.Tools;

public static class Extensions
{
    public static Date ToDate(this DateTime dateTime) => new(dateTime.Year, dateTime.Month, dateTime.Day);

    public static DateTime ToDateTime(this Date date) => new(date.Year, date.Month, date.Day);
}