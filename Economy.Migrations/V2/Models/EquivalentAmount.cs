using System.Diagnostics.Contracts;

namespace Economy.Migrations.V2.Models;

public record EquivalentAmount(decimal Amount = 0)
{
    public string ToDetails() => $"{Amount} eUSD";

    public static EquivalentAmount operator +(EquivalentAmount a, EquivalentAmount b) => new(a.Amount + b.Amount);

    [Pure]
    public EquivalentAmount Add(EquivalentAmount another, bool subtract = false)
        => subtract ? new(Amount - another.Amount) : new(Amount + another.Amount);
}