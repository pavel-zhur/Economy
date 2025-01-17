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
    Date Date)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        new List<EntityFullId?>
        {
            Amount.CurrencyId.ToEntityFullId(EntityType.Currency),
            FromPlanId.ToEntityFullId(EntityType.Plan),
            ToPlanId.ToEntityFullId(EntityType.Plan),
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

    public override Details ToDetails()
        => new(GetEntityType())
        {
            ["Id"] = Id,
            [EntityType.Plan, "From"] = FromPlanId,
            [EntityType.Plan, "To"] = ToPlanId,
            ["Amount"] = Amount.ToDetails(),
            ["Date"] = Date,
        };
}