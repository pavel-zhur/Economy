using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.State;

[method: JsonConstructor]
public record TransactionEntry(
    string? Name,
    string? SpecialNotes,
    int? CategoryId,
    int? WalletId,
    int? PlanId,
    Amounts Amounts)
{
    public void Validate()
    {
        if (Name != null && string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Transaction entry name must be null or not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Transaction entry special notes must be null or not empty.");
        }

        Amounts.Validate(false, false, true);
    }

    [Obsolete] // todo: make better
    public string ToDetailsNoAmounts(Repositories repositories)
        => $"{Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {repositories.GetReferenceTitle(WalletId, EntityType.Wallet)} {repositories.GetReferenceTitle(CategoryId, EntityType.Category)}";

    public string ToDetails(Repositories repositories)
        => $"{Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {repositories.GetReferenceTitle(WalletId, EntityType.Wallet)} {repositories.GetReferenceTitle(CategoryId, EntityType.Category)} {Amounts.ToDetails(repositories)}";
}