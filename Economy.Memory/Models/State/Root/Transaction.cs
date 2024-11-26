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
    string? SpecialNotes,
    int PlanId,
    TransactionType Type,
    TransactionPlannedAmount? Planned,
    TransactionActualAmount? Actual)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        (Planned?.GetForeignKeysDirty() ?? Enumerable.Empty<EntityFullId?>())
        .Concat(Actual?.GetForeignKeysDirty() ?? Enumerable.Empty<EntityFullId?>())
        .Append(PlanId.ToEntityFullId(EntityType.Plan));

    internal override void Validate(Repositories repositories)
    {
        if (Planned == null && Actual == null)
        {
            throw new ArgumentException("Transaction must have either planned or actual amounts.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Transaction special notes must be null or not empty.");
        }

        Planned?.Validate();
        Actual?.Validate();
    }

    public override string ToReferenceTitle()
        => $"[T-{Id}]";

    public string ToDetailsNoAmountsOrType(Repositories repositories)
        => $"{Id} {(SpecialNotes == null ? null : $" n:({SpecialNotes})")} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)}";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {(SpecialNotes == null ? null : $" n:({SpecialNotes})")} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {Type} {Planned?.ToDetails(repositories)} {Actual?.ToDetails(repositories)}";
}