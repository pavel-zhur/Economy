using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Tools;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Transfer)]
[method: JsonConstructor]
public record Transfer(
    int Id,
    int FromPlanId,
    int ToPlanId,
    Amount TransferredAmount,
    Date Date,
    TransferType TransferType)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        new List<EntityFullId?>
        {
            TransferredAmount.CurrencyId.ToEntityFullId(EntityType.Currency),
            FromPlanId.ToEntityFullId(EntityType.Plan),
            ToPlanId.ToEntityFullId(EntityType.Plan),
        };

    public override void Validate(Repositories repositories)
    {
        TransferredAmount.Validate(false, false, true);

        // todo: probably adjust years or extract to constants
        if (Date.Year < 2020 || Date.Year > 2040)
        {
            throw new ArgumentException("Transfer date must be between 2020 and 2040.");
        }

        if (FromPlanId == ToPlanId)
        {
            throw new ArgumentException("Transfer plans must be different.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromPlanId, EntityType.Plan)} -> {repositories.GetReferenceTitle(ToPlanId, EntityType.Plan)} {TransferredAmount.ToDetails(repositories)} {Date} {TransferType}";
}