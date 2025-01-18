using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.Reports;

public record PlanFlow1Record(
    Date Date,
    decimal? Flow,
    PlanFlowRecordType Type,
    int? MainPlanId) 
    : PlanRecord(Date, Flow)
{
    public override IReadOnlyList<(int? planId, bool reverse)> PlanIds => [(MainPlanId, false)];

    public override Details ToDetails(int? viewFromPlanId)
        => new()
        {
            ["Date"] = Date.ToString(),
            ["Flow"] = Flow,
            ["Type"] = Type,
            [EntityType.Plan] = viewFromPlanId.HasValue
                ? null
                : MainPlanId,
        };
}