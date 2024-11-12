using Economy.AiInterface.Scope;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State;
using Economy.Memory.Tools;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class Report1Model(StateFactory stateFactory) : PageModel
{
    [BindProperty(SupportsGet = true)]
    public DateTime? From { get; set; }

    [BindProperty(SupportsGet = true)]
    public DateTime? To { get; set; }

    [BindProperty(SupportsGet = true)]
    public DayOfWeek? WeekStart { get; set; }

    public List<Row> Rows { get; } = new();

    public async Task OnGet()
    {
        var state = await stateFactory.Get();

        // todo: remove hard-coded values
        WeekStart ??= DayOfWeek.Saturday;
        From ??= new(2024, 10, 31);
        To ??= new(2025, 3, 31);

        if (To < From) To = From.Value.AddDays(1);

        Row before = new() { Date = From.Value.ToDate().AddDays(-1) };
        Row after = new() { Date = To.Value.ToDate().AddDays(1) };
        var rows = Enumerable.Range(0, (int)(To - From).Value.TotalDays + 1).Select(i => From.Value.AddDays(i)).ToDictionary(x => x.ToDate(), x => new Row
        {
            Date = x.ToDate(),
        });

        Row FindRow(Date date) =>
            rows.GetValueOrDefault(date) ?? (date < From.Value.ToDate() ? before : after);

        Dictionary<int, List<ActualMatch>> plannedTransactionMatches = new();
        foreach (var actualTransaction in state.Repositories.Transactions.GetAll())
        {
            var row = FindRow(actualTransaction.DateAndTime.ToDate());

            foreach (var actualTransactionEntry in actualTransaction.Entries)
            {
                TransactionType transactionType;
                ActualMatch match;
                if (actualTransactionEntry.PlanId != null && state.Repositories.Plans[actualTransactionEntry.PlanId.Value] is { Volume: not null } plannedTransaction)
                {
                    var planId = actualTransactionEntry.PlanId.Value;
                    transactionType = plannedTransaction.Volume!.Type;
                    match = new PlannedAndActualMatch
                    {
                        Planned = plannedTransaction,
                        Entry = actualTransactionEntry,
                        Actual = actualTransaction,
                        Negative = actualTransaction.Type != transactionType,
                    };

                    (plannedTransactionMatches.TryGetValue(planId, out var list) 
                            ? list
                            : plannedTransactionMatches[planId] = new())
                            .Add(match);
                }
                else
                {
                    transactionType = actualTransaction.Type;
                    match = new ActualMatch
                    {
                        Actual = actualTransaction,
                        Entry = actualTransactionEntry,
                    };
                }

                (transactionType switch
                {
                    TransactionType.Income => row.Incomes,
                    TransactionType.Expense => row.Expenses,
                    _ => throw new ArgumentOutOfRangeException()
                }).Add(match);
            }
        }

        foreach (var plannedTransaction in state.Repositories.Plans.GetAll().Where(x => x.Volume != null))
        {
            var matches = plannedTransactionMatches.GetValueOrDefault(plannedTransaction.Id);
            MatchBase match;
            if (matches != null)
            {
                var remainder = new Amounts
                {
                    plannedTransaction.Volume!.Amounts,
                };

                foreach (var actualMatch in matches)
                {
                    remainder.Add(actualMatch.Entry.Amounts, actualMatch.Actual.Type == plannedTransaction.Volume.Type);
                }

                remainder.RemoveAll(x => x.Value < 0);

                if (!remainder.Any())
                {
                    continue;
                }

                match = new PlannedRemainderMatch
                {
                    Planned = plannedTransaction,
                    Remainder = remainder,
                };
            }
            else
            {
                match = new PlannedMatch
                {
                    Planned = plannedTransaction,
                };
            }

            var row = FindRow(FindNearestParentPlan(state, plannedTransaction.Id, x => x.StartDate.HasValue)?.StartDate ?? new Date());

            (plannedTransaction.Volume.Type switch
            {
                TransactionType.Expense => row.Expenses,
                TransactionType.Income => row.Incomes,
                _ => throw new ArgumentOutOfRangeException(),
            }).Add(match);
        }

        Rows.AddRange(rows.Values.Append(before).Append(after).OrderBy(x => x.Date));
    }

    private Plan? FindNearestParentPlan(State state, int planId, Func<Plan, bool> planSelector)
    {
        var plan = state.Repositories.Plans[planId];
        while (plan != null && !planSelector(plan))
        {
            plan = plan.ParentPlanId.HasValue ? state.Repositories.Plans[plan.ParentPlanId.Value] : null;
        }

        return plan;
    }

    public class Row
    {
        public Date Date { get; init; }
        public List<MatchBase> Incomes { get; } = new();
        public List<MatchBase> Expenses { get; } = new();
    }

    public abstract class MatchBase;

    public class PlannedAndActualMatch : ActualMatch
    {
        public required bool Negative { get; init; }
        public required Plan Planned { get; init; }
    }

    public class ActualMatch : MatchBase
    {
        public required Transaction Actual { get; init; }
        public required TransactionEntry Entry { get; init; }
    }

    public class PlannedRemainderMatch : MatchBase
    {
        public required Plan Planned { get; init; }
        public required Amounts Remainder { get; init; }
    }

    public class PlannedMatch : MatchBase
    {
        public required Plan Planned { get; init; }
    }
}