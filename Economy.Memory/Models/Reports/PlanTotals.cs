using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Models.Reports;

public class PlanTotals : IReadOnlyPlanTotals
{
    private readonly SortedDictionary<Date, decimal> _balances = new();
    private readonly SortedDictionary<Date, decimal> _subtreeBalanceSums = new();
    private readonly SortedDictionary<Date, decimal> _subtreeNegativeBalanceSums = new();
    private readonly SortedDictionary<Date, decimal> _subtreePositiveBalanceSums = new();

    public PlanTotals(IReadOnlyList<(Date date, decimal? flow, PlanRecord record)> records)
    {
        var recordsAggregated = new List<(Date date, decimal? flow, decimal balance, PlanRecord record)>();

        decimal balance = 0;
        foreach (var record in records)
        {
            balance += record.flow ?? 0;
            recordsAggregated.Add((record.date, record.flow, balance, record.record));
        }

        Records = recordsAggregated;

        foreach (var (date, flow, _, _) in Records)
        {
            if (flow.HasValue)
            {
                if (_balances.ContainsKey(date))
                    _balances[date] += flow.Value;
                else
                    _balances[date] = flow.Value;
            }
        }

        // Calculate cumulative balances
        decimal cumulative = 0;
        foreach (var date in _balances.Keys.ToList())
        {
            cumulative += _balances[date];
            _balances[date] = cumulative;
        }
    }

    public IReadOnlyList<(Date date, decimal? flow, decimal balance, PlanRecord record)> Records { get; }

    public IEnumerable<KeyValuePair<Date, decimal>> Balances => _balances;
    public IEnumerable<KeyValuePair<Date, decimal>> SubtreeBalanceSums => _subtreeBalanceSums;
    public IEnumerable<KeyValuePair<Date, decimal>> SubtreeNegativeBalanceSums => _subtreeNegativeBalanceSums;
    public IEnumerable<KeyValuePair<Date, decimal>> SubtreePositiveBalanceSums => _subtreePositiveBalanceSums;

    public PlanTotalsPoint GetPoint(Date date)
    {
        decimal GetValueOrDefault(SortedDictionary<Date, decimal> dictionary) =>
            dictionary.TryGetValue(date, out var value) ? value : dictionary.LastOrDefault(x => x.Key <= date).Value;

        return new PlanTotalsPoint(
            GetValueOrDefault(_balances),
            GetValueOrDefault(_subtreeBalanceSums),
            GetValueOrDefault(_subtreeNegativeBalanceSums),
            GetValueOrDefault(_subtreePositiveBalanceSums));
    }

    public void InitSubtree(IEnumerable<PlanTotals> subtreeTotals)
    {
        decimal cumulativeSum = 0;
        decimal cumulativeNegativeSum = 0;
        decimal cumulativePositiveSum = 0;
        
        foreach (var group in subtreeTotals
                     .SelectMany(x => x.Balances)
                     .GroupBy(x => x.Key, x => x.Value)
                     .OrderBy(x => x.Key))
        {
            var anyNegative = false;
            var anyPositive = false;
            foreach (var value in group)
            {
                cumulativeSum += value;
                if (value < 0)
                {
                    cumulativeNegativeSum += value;
                    anyNegative = true;
                }
                else
                {
                    cumulativePositiveSum += value;
                    anyPositive = true;
                }
            }

            _subtreeBalanceSums[group.Key] = cumulativeSum;

            if (anyNegative)
                _subtreeNegativeBalanceSums[group.Key] = cumulativeNegativeSum;

            if (anyPositive)
                _subtreePositiveBalanceSums[group.Key] = cumulativePositiveSum;
        }
    }
}