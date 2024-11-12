using System.Diagnostics.Contracts;

namespace Economy.Memory.Models;

public record EquivalentAmount(decimal Amount = 0)
{
    public string ToDetails() => $"{Amount} eUSD";

    public static EquivalentAmount operator +(EquivalentAmount a, EquivalentAmount b) => new(a.Amount + b.Amount);

    [Pure]
    public EquivalentAmount Add(EquivalentAmount another, bool subtract = false)
        => subtract ? new(Amount - another.Amount) : new(Amount + another.Amount);

    public EquivalentAmount Negate(bool @do) => @do ? new(-Amount) : this;
}