using System.Text.Json.Serialization;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Models.State.Sub;

[method: JsonConstructor]
public record TransactionPlannedAmount(
    Date Date,
    Amounts Amounts)
{
    internal IEnumerable<EntityFullId?> GetForeignKeysDirty() => Amounts.GetForeignKeysDirty();

    public void Validate()
    {
        Date.Validate();
        Amounts.Validate(false, false, true, false);
    }

    public string ToDetails(IHistory repositories)
        => $"[P: {Date} {Amounts.ToDetails(repositories)}]";
}