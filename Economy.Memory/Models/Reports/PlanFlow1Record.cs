using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Models.Reports;

public record PlanFlow1Record(
    Date Date,
    decimal? Flow,
    PlanFlowRecordType Type,
    int? MainPlanId) 
    : PlanRecord(Date, Flow)
{
    public override IReadOnlyList<(int? planId, bool reverse)> PlanIds => [(MainPlanId, false)];

    public override string ToDetails(Repositories repositories, int? viewFromPlanId)
        => string.Join(", ", new[]
        {
            Date.ToString(),
            Flow?.ToString(),
            Type.ToString(),
            viewFromPlanId.HasValue 
                ? null
                : repositories.GetReferenceTitle(MainPlanId, EntityType.Plan),
        }.Where(x => x != null));
}