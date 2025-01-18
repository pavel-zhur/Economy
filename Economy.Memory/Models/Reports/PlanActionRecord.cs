using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.Reports;

public record PlanActionRecord(
    Date Date,
    PlanActionRecordType Type,
    int PlanId)
    : PlanRecord(Date, null)
{
    public override IReadOnlyList<(int? planId, bool reverse)> PlanIds => [(PlanId, false)];

    public override Details ToDetails(int? viewFromPlanId)
        => new()
        {
            ["Date"] = Date.ToString(),
            ["Type"] = Type,
            [EntityType.Plan] = viewFromPlanId.HasValue ? null : PlanId,
        };
}