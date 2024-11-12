using Economy.Migrations.V2.Containers.Repositories;
using OneShelf.Common;

namespace Economy.Migrations.V2.Models.State;

[Obsolete("Refactor")] // todo: think
public class Amounts : List<Amount>
{
    public void Validate(bool allowNegative, bool allowZero, bool allowPositive)
    {
        if (this.AnyDuplicates(a => a.CurrencyId, out _))
        {
            throw new ArgumentException("Amounts must have unique currency IDs.");
        }

        foreach (var amount in this)
        {
            amount.Validate(allowNegative, allowZero, allowPositive);
        }
    }

    public string ToDetails(Repositories repositories)
        => string.Join(", ", this.Select(a => a.ToDetails(repositories)));

    [Obsolete("Refactor")] // todo: think
    public void Add(Amounts other, bool subtract = false)
    {
        var result = other.Select(a => a.CurrencyId)
            .Union(this.Select(a => a.CurrencyId))
            .Select(c =>
            {
                var thisValue = this.FirstOrDefault(a => a.CurrencyId == c).Value;
                var otherValue = other.FirstOrDefault(a => a.CurrencyId == c).Value;
                var result = subtract ? thisValue - otherValue : thisValue + otherValue;
                return new Amount(c, result);
            })
            .Where(x => x.Value != 0)
            .ToList();

        Clear();
        AddRange(result);
    }

    internal IEnumerable<EntityFullId?> GetForeignKeysDirty() => this.Select(x => new EntityFullId(EntityType.Currency, x.CurrencyId).OnceAsNullable());
}