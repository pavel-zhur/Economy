using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.Reports;

public record PlanFlow2Record(
    Date Date,
    decimal? Flow,
    PlanFlowRecordType Type,
    int? MainPlanId,
    int ReversePlanId) 
    : PlanRecord(Date, Flow)
{
    public override IReadOnlyList<(int? planId, bool reverse)> PlanIds =>
    [
        (MainPlanId, false),
        (ReversePlanId, true),
    ];

    public override Details ToDetails(int? viewFromPlanId)
        => new()
        {
            ["Date"] = Date.ToString(),
            ["Flow"] = Flow,
            ["Type"] = Type,
            [EntityType.Plan, "Main"] = viewFromPlanId != MainPlanId ? MainPlanId : null,
            [EntityType.Plan, "Reverse"] = viewFromPlanId != ReversePlanId ? ReversePlanId : null,
        };
}