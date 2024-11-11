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

    public State State { get; set; } = null!;

    public async Task OnGet()
    {
        State = await stateFactory.Get();

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

        Dictionary<string, List<ActualMatch>> plannedTransactionMatches = new();
        foreach (var actualTransaction in State.Repositories.Transactions.GetAll())
        {
            var row = FindRow(actualTransaction.DateAndTime.ToDate());

            foreach (var actualTransactionEntry in actualTransaction.Entries)
            {
                TransactionType transactionType;
                ActualMatch match;
                if (actualTransactionEntry.PlanId != null)
                {
                    var plannedTransaction = State.Repositories.Plans[actualTransactionEntry.PlanId];
                    transactionType = plannedTransaction.Type;
                    match = new PlannedAndActualMatch
                    {
                        Planned = plannedTransaction,
                        Entry = actualTransactionEntry,
                        Actual = actualTransaction,
                        Negative = actualTransaction.Type != transactionType,
                    };

                    (plannedTransactionMatches.TryGetValue(actualTransactionEntry.PlanId, out var list) 
                            ? list
                            : plannedTransactionMatches[actualTransactionEntry.PlanId] = new())
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

        foreach (var plannedTransaction in State.Repositories.Plans.GetAll())
        {
            var matches = plannedTransactionMatches.GetValueOrDefault(plannedTransaction.Id);
            MatchBase match;
            if (matches != null)
            {
                var remainder = new Amounts
                {
                    plannedTransaction.Amounts,
                };

                foreach (var actualMatch in matches)
                {
                    remainder.Add(actualMatch.Entry.Amounts, actualMatch.Actual.Type == plannedTransaction.Type);
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

            var row = FindRow(FindNearestParentPlan(State, plannedTransaction.Id, x => x.StartDate.HasValue).StartDate!.Value);

            (plannedTransaction.Type switch
            {
                TransactionType.Expense => row.Expenses,
                TransactionType.Income => row.Incomes,
                _ => throw new ArgumentOutOfRangeException(),
            }).Add(match);
        }

        Rows.AddRange(rows.Values.Append(before).Append(after).OrderBy(x => x.Date));
    }

    private Plan FindNearestParentPlan(State state, string planId, Func<Plan, bool> planSelector)
    {
        var plan = state.Repositories.Plans[planId];
        while (!planSelector(plan))
        {
            plan = state.Repositories.Plans[plan.ParentPlanId!];
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