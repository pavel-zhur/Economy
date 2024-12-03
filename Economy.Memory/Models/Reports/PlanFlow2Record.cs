using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Sub;

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

    public override string ToDetails(Repositories repositories, int? viewFromPlanId)
        => string.Join(", ", new[]
        {
            Date.ToString(),
            Flow?.ToString(),
            Type.ToString(),
            viewFromPlanId.HasValue 
                ? viewFromPlanId == MainPlanId
                    ? $"reverse: {repositories.GetReferenceTitle(ReversePlanId, EntityType.Plan)}"
                    : MainPlanId.HasValue ? $"main: {repositories.GetReferenceTitle(MainPlanId, EntityType.Plan)}" : null
                : $"[main: {repositories.GetReferenceTitle(MainPlanId, EntityType.Plan) ?? "-"}, rev: {repositories.GetReferenceTitle(ReversePlanId, EntityType.Plan) ?? "-"}]",
        }.Where(x => x != null));
}