using System.Text.Json.Serialization;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Sub;

[method: JsonConstructor]
public record TransactionActualAmount(
    DateTime DateAndTime,
    Amounts Amounts)
{
    internal IEnumerable<EntityFullId?> GetForeignKeysDirty() => Amounts.GetForeignKeysDirty();

    public void Validate()
    {
        DateAndTime.Validate();

        Amounts.Validate(false, false, true, false);
    }

    public string ToDetails(IHistory repositories)
        => $"[A: {DateAndTime} {Amounts.ToDetails(repositories)}]";
}