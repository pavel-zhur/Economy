using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Tools;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.WalletAudit)]
[method: JsonConstructor]
public record WalletAudit(int Id, int WalletId, DateTime CheckDateAndTime, Amounts Amounts) : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => Amounts.GetForeignKeysDirty().Append(WalletId.ToEntityFullId(EntityType.Wallet));

    public override void Validate(Repositories repositories)
    {
        Amounts.Validate(false, true, true);

        if (CheckDateAndTime.Year < 2020 || CheckDateAndTime.Year > 2040)
        {
            throw new ArgumentException("Check timestamp must be between 2020 and 2040.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(WalletId, EntityType.Wallet)} {CheckDateAndTime} [{Amounts.ToDetails(repositories)}]";
}