using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models;
using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Tools;

public static class Extensions
{
    public static Date ToDate(this DateTime dateTime) => new(dateTime.Year, dateTime.Month, dateTime.Day);

    public static DateTime ToDateTime(this Date date) => new(date.Year, date.Month, date.Day);

    public static EntityFullId ToEntityFullId(this int id, EntityType entityType) => new(entityType, id);
    
    public static EntityFullId? ToEntityFullId(this int? id, EntityType entityType) => id.HasValue ? new(entityType, id.Value) : null;

    public static string WithDayOfWeek(this Date date) => $"{date.ToDateTime().DayOfWeek.ToString()[..3]} {date}";
    
    public static string WithDayOfWeek(this DateTime dateTime) => $"{dateTime:ddd dd.MM.yyyy HH:mm}";

    [Obsolete] // todo: fix
    public static EquivalentAmount ToEquivalentAmount(this Amounts amounts, Repositories repositories)
    {
        decimal total = 0;
        foreach (var amount in amounts)
        {
            var currency = repositories.Currencies[amount.CurrencyId];
            total += currency.Abbreviation switch
            {
                "USD" => amount.Value,
                "BYN" => Math.Round(amount.Value / 3.313m, 2),
                "VND" => Math.Round(amount.Value / 23_821, 2),
                "THB" => Math.Round(amount.Value / 32.27m, 2),
                _ => throw new ArgumentOutOfRangeException(nameof(currency.Abbreviation), currency.Abbreviation,
                    "Couldn't convert to eUSD."),
            };
        }

        return new(total);
    }

    internal static void Validate(this DateTime dateTime)
    {
        if (dateTime.Year is < 2020 or > 2040)
        {
            throw new ArgumentException("Date and time year must be between 2020 and 2040.");
        }
    }
}