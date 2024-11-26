using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Root;

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

    internal override void Validate(Repositories repositories)
    {
        FromAmount.Validate(false, false, true);
        ToAmount.Validate(false, false, true);

        DateAndTime.Validate();

        if (FromAmount.CurrencyId == ToAmount.CurrencyId)
        {
            throw new ArgumentException("Conversion currencies must be different.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromWalletId, EntityType.Wallet)} {FromAmount.ToDetails(repositories)} -> {repositories.GetReferenceTitle(ToWalletId, EntityType.Wallet)} {ToAmount.ToDetails(repositories)}";
}