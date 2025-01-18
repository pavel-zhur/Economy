using System.Text.Json.Serialization;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Tools;

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

    public Details ToDetails()
        => new()
        {
            [EntityType.Currency] = CurrencyId,
            [Details.CurrencyAmountProperty] = Value,
        };
}