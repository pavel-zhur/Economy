using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Tools;
using OneShelf.Common;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Transaction)]
[method: JsonConstructor]
public record Transaction(
    int Id,
    string Name,
    string? SpecialNotes,
    DateTime DateAndTime,
    TransactionType Type,
    IReadOnlyList<TransactionEntry> Entries)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        Entries.SelectMany(e => new[]
        {
            e.WalletId.ToEntityFullId(EntityType.Wallet),
            e.PlanId.ToEntityFullId(EntityType.Plan),
            e.CategoryId.ToEntityFullId(EntityType.Category),
        }.Concat(e.Amounts.GetForeignKeysDirty()));

    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Transaction name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Transaction special notes must be null or not empty.");
        }

        if (DateAndTime.Year < 2020 || DateAndTime.Year > 2040)
        {
            throw new ArgumentException("Transaction timestamp must be between 2020 and 2040.");
        }

        if (Entries.AnyDuplicates(e => (e.WalletId, e.CategoryId), out _))
        {
            throw new ArgumentException("Transaction entries must have unique wallet IDs.");
        }

        foreach (var entry in Entries)
        {
            entry.Validate();
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    [Obsolete] // todo: make better
    public string ToDetailsNoEntriesNoTypeNoTimestamp(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")}";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")} {DateAndTime} {Type} [{string.Join(", ", Entries.Select(e => e.ToDetails(repositories)))}]";
}