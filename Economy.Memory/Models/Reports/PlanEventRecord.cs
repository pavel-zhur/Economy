using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.Reports;

public record PlanEventRecord(
    Date Date,
    Event Event)
    : PlanRecord(Date, null)
{
    public override IReadOnlyList<(int? planId, bool reverse)> PlanIds => [(Event.PlanId, false)];

    public override Details ToDetails(int? viewFromPlanId)
        => new()
        {
            ["Date"] = Date.ToString(),
            ["Event"] = Event.ToDetails(),
            [EntityType.Plan] = viewFromPlanId.HasValue ? null : Event.PlanId,
        };
}