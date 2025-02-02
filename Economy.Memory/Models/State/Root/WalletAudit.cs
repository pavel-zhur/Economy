﻿using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.WalletAudit)]
[method: JsonConstructor]
public record WalletAudit(int Id, int WalletId, DateTime CheckDateAndTime, Amounts Amounts) : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => Amounts.GetForeignKeysDirty().Append(WalletId.ToEntityFullId(EntityType.Wallet));

    internal override void Validate(Repositories repositories)
    {
        Amounts.Validate(false, true, true, false);

        CheckDateAndTime.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {repositories.GetReferenceTitle(WalletId, EntityType.Wallet)} {CheckDateAndTime} [{Amounts.ToDetails(repositories)}]";
}