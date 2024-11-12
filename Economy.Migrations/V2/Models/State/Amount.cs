using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.State;

[method: JsonConstructor]
public record struct Amount(int CurrencyId, decimal Value)
{
    public void Validate(bool allowNegative, bool allowZero, bool allowPositive)
    {
        if (Value < 0 && !allowNegative)
        {
            throw new ArgumentException("Amount value must be non-negative.");
        }

        if (Value == 0 && !allowZero)
        {
            throw new ArgumentException("Amount value must be non-zero.");
        }

        if (Value > 0 && !allowPositive)
        {
            throw new ArgumentException("Amount value must be non-positive.");
        }
    }

    public string ToDetails(Repositories repositories)
    {
        var currency = repositories.Currencies[CurrencyId];
        var value = Value;
        string? prefix = null;
        switch (currency.CustomDisplayUnit)
        {
            case CurrencyCustomDisplayUnit.Thousands:
                value /= 1000;
                prefix = "k";
                break;
            case CurrencyCustomDisplayUnit.Millions:
                value /= 1_000_000;
                prefix = "m";
                break;
        }

        return $"{value} {prefix}{currency.Abbreviation}";
    }
}