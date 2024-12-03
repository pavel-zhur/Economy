using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Models.Reports;

public record PlanActionRecord(
    Date Date,
    PlanActionRecordType Type,
    int PlanId)
    : PlanRecord(Date, null)
{
    public override IReadOnlyList<(int? planId, bool reverse)> PlanIds => [(PlanId, false)];

    public override string ToDetails(Repositories repositories, int? viewFromPlanId)
        => string.Join(", ", new[]
        {
            Date.ToString(),
            Type.ToString(),
            viewFromPlanId.HasValue ? null : repositories.GetReferenceTitle(PlanId, EntityType.Plan),
        }.Where(x => x != null));
}