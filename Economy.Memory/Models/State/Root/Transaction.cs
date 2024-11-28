using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Transaction)]
[method: JsonConstructor]
public record Transaction(
    int Id,
    int? PlanId,
    string Name,
    string? SpecialNotes,
    TransactionType Type,
    DateTime DateAndTime,
    Amounts Amounts)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        Amounts.GetForeignKeysDirty().Append(PlanId.ToEntityFullId(EntityType.Plan));

    internal override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Transaction name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Transaction special notes must be null or not empty.");
        }

        Amounts?.Validate(false, false, true, false);
    }

    public override string ToReferenceTitle()
        => $"[T-{Id}]";

    public string ToDetailsNoAmountsOrType(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {Name} {(SpecialNotes == null ? null : $" n:({SpecialNotes})")}";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {Name} {(SpecialNotes == null ? null : $" n:({SpecialNotes})")} {Type} {Amounts.ToDetails(repositories)}";
}