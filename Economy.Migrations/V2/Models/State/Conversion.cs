using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Tools;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Conversion)]
[method: JsonConstructor]
public record Conversion(
    int Id,
    int FromWalletId,
    Amount FromAmount,
    int ToWalletId,
    Amount ToAmount,
    DateTime DateAndTime)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
    [
        FromWalletId.ToEntityFullId(EntityType.Wallet),
        ToWalletId.ToEntityFullId(EntityType.Wallet),
        FromAmount.CurrencyId.ToEntityFullId(EntityType.Currency),
        ToAmount.CurrencyId.ToEntityFullId(EntityType.Currency), 
    ];

    public override void Validate(Repositories repositories)
    {
        FromAmount.Validate(false, false, true);
        ToAmount.Validate(false, false, true);

        if (FromAmount.CurrencyId == ToAmount.CurrencyId)
        {
            throw new ArgumentException("Conversion currencies must be different.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromWalletId, EntityType.Wallet)} {FromAmount.ToDetails(repositories)} -> {repositories.GetReferenceTitle(ToWalletId, EntityType.Wallet)} {ToAmount.ToDetails(repositories)}";
}