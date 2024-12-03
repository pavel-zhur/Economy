using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Models.Reports;

public abstract record PlanRecord(
    Date Date,
    decimal? Flow)
{
    public abstract IReadOnlyList<(int? planId, bool reverse)> PlanIds { get; }

    public abstract string ToDetails(Repositories repositories, int? viewFromPlanId);
}