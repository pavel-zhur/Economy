using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Models;
using Economy.Migrations.V2.Models.State;

namespace Economy.Migrations.V2.Tools;

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
                _ => throw new ArgumentOutOfRangeException(nameof(currency.Abbreviation), currency.Abbreviation,
                    "Couldn't convert to eUSD."),
            };
        }

        return new(total);
    }
}