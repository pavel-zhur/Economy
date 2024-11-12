using Economy.AiInterface.Scope;
using Economy.Memory.Containers.State;
using Economy.Memory.Models;
using Economy.Memory.Models.State;
using Economy.Memory.Tools;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OneShelf.Common;

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

        Row FindRow(Date date) => (rows.GetValueOrDefault(date) ?? (date < From.Value.ToDate() ? before : after));

        List<MatchBase> FindMatches(Date date, TransactionType transactionType) =>
            FindRow(date).SelectSingle(r => transactionType switch
            {
                TransactionType.Income => r.Incomes,
                TransactionType.Expense => r.Expenses,
                _ => throw new ArgumentOutOfRangeException(nameof(transactionType), transactionType, null)
            });

        Dictionary<int, List<ActualMatch>> plannedTransactionMatches = new();
        foreach (var transaction in state.Repositories.Transactions.GetAll())
        {
            if (transaction.Actual != null)
            {
                if (transaction.Planned == null)
                {
                    FindMatches(transaction.Actual.DateAndTime.ToDate(), transaction.Type).Add(new ActualMatch
                    {
                        Transaction = transaction,
                        Actual = transaction.Actual,
                        BalanceDelta = transaction.Actual.Amounts.ToEquivalentAmount(state.Repositories).Negate(transaction.Type == TransactionType.Expense),
                    });
                }
                else
                {
                    var remainder = new Amounts();
                    remainder.Add(transaction.Planned.Amounts);
                    remainder.Add(transaction.Actual.Amounts, true);

                    FindMatches(transaction.Actual.DateAndTime.ToDate(), transaction.Type).Add(new PlannedAndActualMatch
                    {
                        Transaction = transaction,
                        Planned = transaction.Planned,
                        Actual = transaction.Actual,
                        BalanceDelta = transaction.Actual.Amounts.ToEquivalentAmount(state.Repositories).Negate(transaction.Type == TransactionType.Expense),
                    });

                    if (remainder.ToEquivalentAmount(state.Repositories).Amount > 0)
                    {
                        FindMatches(transaction.Planned.Date, transaction.Type).Add(new PlannedRemainderMatch
                        {
                            Transaction = transaction,
                            Planned = transaction.Planned,
                            Remainder = remainder,
                            BalanceDelta = remainder.ToEquivalentAmount(state.Repositories).Negate(transaction.Type == TransactionType.Expense),
                        });
                    }
                }
            }
            else
            {
                FindMatches(transaction.Planned!.Date, transaction.Type).Add(new PlannedMatch
                {
                    Transaction = transaction,
                    Planned = transaction.Planned,
                    BalanceDelta = transaction.Planned.Amounts.ToEquivalentAmount(state.Repositories).Negate(transaction.Type == TransactionType.Expense),
                });
            }
        }

        Rows.AddRange(rows.Values.Append(before).Append(after).OrderBy(x => x.Date));

        var balance = new EquivalentAmount();
        foreach (var row in Rows)
        {
            row.Incomes.ForEach(x => balance = balance.Add(x.BalanceDelta));
            row.Expenses.ForEach(x => balance = balance.Add(x.BalanceDelta));
            row.Balance = balance;
        }

        foreach (var @event in state.Repositories.Events.GetAll().Where(e => e.Date >= From.Value.ToDate() && e.Date <= To.Value.ToDate()))
        {
            FindRow(@event.Date).Events.Add(@event);
        }
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
        public EquivalentAmount Balance { get; set; } = null!;
        public List<Event> Events { get; } = [];
    }

    public abstract class MatchBase
    {
        public required Transaction Transaction { get; init; }
        public required EquivalentAmount BalanceDelta { get; init; }
    }

    public class PlannedAndActualMatch : MatchBase
    {
        public required TransactionPlannedAmount Planned { get; init; }
        public required TransactionActualAmount Actual { get; init; }
    }

    public class ActualMatch : MatchBase
    {
        public required TransactionActualAmount Actual { get; init; }
    }

    public class PlannedRemainderMatch : MatchBase
    {
        public required TransactionPlannedAmount Planned { get; init; }
        public required Amounts Remainder { get; init; }
    }

    public class PlannedMatch : MatchBase
    {
        public required TransactionPlannedAmount Planned { get; init; }
    }
}