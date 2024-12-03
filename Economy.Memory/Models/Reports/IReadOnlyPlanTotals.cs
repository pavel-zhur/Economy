using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Models.Reports;

public interface IReadOnlyPlanTotals
{
    IEnumerable<KeyValuePair<Date, decimal>> Balances { get; }
    IEnumerable<KeyValuePair<Date, decimal>> SubtreeBalanceSums { get; }
    IEnumerable<KeyValuePair<Date, decimal>> SubtreeNegativeBalanceSums { get; }
    IEnumerable<KeyValuePair<Date, decimal>> SubtreePositiveBalanceSums { get; }
    IReadOnlyList<(Date date, decimal? flow, decimal balance, PlanRecord record)> Records { get; }
}