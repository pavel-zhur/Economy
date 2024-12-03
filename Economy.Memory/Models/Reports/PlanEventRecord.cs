using Economy.Memory.Containers.Repositories;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Models.Reports;

public record PlanEventRecord(
    Date Date,
    Event Event)
    : PlanRecord(Date, null)
{
    public override IReadOnlyList<(int? planId, bool reverse)> PlanIds => [(Event.PlanId, false)];

    public override string ToDetails(Repositories repositories, int? viewFromPlanId)
        => string.Join(", ", new[]
        {
            Date.ToString(),
            Event.Name,
            Event.SpecialNotes,
            viewFromPlanId.HasValue ? null : repositories.GetReferenceTitle(Event.PlanId, EntityType.Plan),
        }.Where(x => x != null));
}