using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Models.State.Sub;

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

    public string ToDetails(IHistory repositories)
    {
        var (currencyCustomDisplayUnit, abbreviation) = repositories.GetCurrencyTitles(CurrencyId);
        var value = Value;
        string? prefix = null;
        switch (currencyCustomDisplayUnit)
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

        return $"{value} {prefix}{abbreviation}";
    }
}