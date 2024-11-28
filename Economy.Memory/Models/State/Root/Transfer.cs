using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Transfer)]
[method: JsonConstructor]
public record Transfer(
    int Id,
    int FromPlanId,
    int ToPlanId,
    Amount Amount,
    Date Date,
    TransferType Type)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        new List<EntityFullId?>
        {
            Amount.CurrencyId.ToEntityFullId(EntityType.Currency),
            FromPlanId.ToEntityFullId(EntityType.PlanningNode),
            ToPlanId.ToEntityFullId(EntityType.PlanningNode),
        };

    internal override void Validate(Repositories repositories)
    {
        Amount.Validate(false, false, true);

        Date.Validate();

        if (FromPlanId == ToPlanId)
        {
            throw new ArgumentException("Transfer plans must be different.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromPlanId, EntityType.PlanningNode)} -> {repositories.GetReferenceTitle(ToPlanId, EntityType.PlanningNode)} {Amount.ToDetails(repositories)} {Date} {Type}";

    public string ToDetailsNoAmountOrDate(IHistory repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromPlanId, EntityType.PlanningNode)} -> {repositories.GetReferenceTitle(ToPlanId, EntityType.PlanningNode)} {Type}";
}