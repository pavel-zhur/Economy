using Economy.Engine;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models;
using Economy.Memory.Models.State;
using Economy.Memory.Tools;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OneShelf.Common;

namespace Economy.Web.Pages;

public class Report1Model(StateFactory<State> stateFactory) : PageModel
{
    [BindProperty(SupportsGet = true)]
    public DateTime? From { get; set; }

    [BindProperty(SupportsGet = true)]
    public DateTime? To { get; set; }

    [BindProperty(SupportsGet = true)]
    public DayOfWeek? WeekStart { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? FundsPlanIds { get; set; }

    public List<int>? FundsPlanIdsParsed { get; set; }

    public List<Row> Rows { get; } = new();

    public EquivalentAmount Funds { get; set; } = new();

    public async Task OnGet()
    {
        var state = await stateFactory.GetState();

        // todo: remove hard-coded values
        WeekStart ??= DayOfWeek.Saturday;
        From ??= new(2024, 10, 31);
        To ??= new(2025, 3, 31);
        FundsPlanIds ??= "2";
        
        FundsPlanIdsParsed = FundsPlanIds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(x => int.TryParse(x, out var y) ? y : (int?)null)
                .ToList()
                .SelectSingle(x => x.Any() && x.All(x => x.HasValue) ? x.Select(x => x.Value).ToList() : null);

        FundsPlanIds = FundsPlanIdsParsed == null ? "-" : string.Join(", ", FundsPlanIdsParsed);

        if (To < From) To = From.Value.AddDays(1);

        Row before = new() { Date = From.Value.ToDate().AddDays(-1) };
        Row after = new() { Date = To.Value.ToDate().AddDays(1) };
        var rows = Enumerable.Range(0, (int)(To - From).Value.TotalDays + 1).Select(i => From.Value.AddDays(i)).ToDictionary(x => x.ToDate(), x => new Row
        {
            Date = x.ToDate(),
        });

        Row FindRow(Date date) => (rows.GetValueOrDefault(date) ?? (date < From.Value.ToDate() ? before : after));

        List<MatchBase> FindMatches(Date date, TransactionType? transactionType) =>
            FindRow(date).SelectSingle(r => transactionType switch
            {
                TransactionType.Income => r.Incomes,
                TransactionType.Expense => r.Expenses,
                null => r.Schedules,
                _ => throw new ArgumentOutOfRangeException(nameof(transactionType), transactionType, null)
            });

        var spendOnSchedules = state.Repositories.Plans.GetAll()
            .Where(x => x.Schedule != null)
            .ToDictionary(x => x.Id, x =>
            {
                var total = new Amounts();
                var duration = (int)(x.Schedule.FinishDate.ToDateTime() - x.Schedule.StartDate.ToDateTime()).TotalDays + 1;
                total.Add(x.Schedule!.Amounts, multiplication: duration);
                return (spent: new Amounts(), total, duration);
            });

        foreach (var transaction in state.Repositories.Transactions.GetAll())
        {
            if (FundsPlanIdsParsed?.Contains(transaction.PlanId) == true)
            {
                throw new("ExternalizePlanIdsParsed?.Contains(transaction.PlanId) == true");
            }

            if (transaction.Actual != null)
            {
                if (transaction.Planned == null)
                {
                    if (state.Repositories.Plans[transaction.PlanId].Schedule is { } schedule && transaction.Type == TransactionType.Expense)
                    {
                        var (spent, total, _) = spendOnSchedules[transaction.PlanId];
                        spent.Add(transaction.Actual.Amounts);
                        FindMatches(transaction.Actual.DateAndTime.ToDate(), transaction.Type).Add(new ScheduleAndActualMatch
                        {
                            Transaction = transaction,
                            Actual = transaction.Actual,
                            Schedule = schedule,
                            TotalSchedulePlanned = total,
                        });
                    }
                    else
                    {
                        FindMatches(transaction.Actual.DateAndTime.ToDate(), transaction.Type).Add(new ActualMatch
                        {
                            Transaction = transaction,
                            Actual = transaction.Actual,
                        });
                    }
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
                    });

                    if (remainder.ToEquivalentAmount(state.Repositories).Amount > 0)
                    {
                        FindMatches(transaction.Planned.Date, transaction.Type).Add(new PlannedRemainderMatch
                        {
                            Transaction = transaction,
                            Planned = transaction.Planned,
                            Remainder = remainder,
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
                });
            }
        }

        if (FundsPlanIdsParsed != null)
        {
            foreach (var transfer in state.Repositories.Transfers.GetAll())
            {
                if (FundsPlanIdsParsed.Contains(transfer.FromPlanId) !=
                    FundsPlanIdsParsed.Contains(transfer.ToPlanId))
                {
                    FindRow(transfer.Date).Funds.Add(new ExternalMatch
                    {
                        Transfer = transfer,
                        IsOutgoing = FundsPlanIdsParsed.Contains(transfer.ToPlanId),
                    });
                }
            }
        }

        foreach (var plan in state.Repositories.Plans.GetAll().Where(x => x.Schedule != null))
        {
            var (spent, total, duration) = spendOnSchedules[plan.Id];
            var remainder = new EquivalentAmount(
                Math.Max(Math.Round(
                    (total.ToEquivalentAmount(state.Repositories).Amount -
                     spent.ToEquivalentAmount(state.Repositories).Amount)
                    / duration,
                    2), 0));
            for (Date date = plan.Schedule.StartDate; date <= plan.Schedule.FinishDate; date = date.AddDays(1))
            {
                FindRow(date).Schedules.Add(new ScheduleRemainderMatch
                {
                    IsFull = !spendOnSchedules[plan.Id].spent.Any(),
                    Plan = plan,
                    Remainder = remainder,
                });
            }
        }

        Rows.AddRange(rows.Values.Append(before).Append(after).OrderBy(x => x.Date));

        var balance = new EquivalentAmount();
        foreach (var row in Rows)
        {
            row.Incomes.ForEach(x => balance = balance.Add(x.GetBalanceDelta(state.Repositories)));
            row.Expenses.ForEach(x => balance = balance.Add(x.GetBalanceDelta(state.Repositories)));
            row.Funds.ForEach(x => balance = balance.Add(x.GetBalanceDelta(state.Repositories)));
            row.Schedules.ForEach(x => balance = balance.Add(x.GetBalanceDelta(state.Repositories)));
            row.Funds.ForEach(x => Funds = Funds.Add(x.GetBalanceDelta(state.Repositories), true));
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
        public List<MatchBase> Funds { get; } = new();
        public List<MatchBase> Schedules { get; } = new();
        public EquivalentAmount Balance { get; set; } = null!;
        public List<Event> Events { get; } = [];
    }

    public abstract class MatchBase
    {
        public abstract EquivalentAmount GetBalanceDelta(Repositories repositories);

        public abstract string ToDetailsNoAmountsOrType(Repositories repositories);
    }

    public class ExternalMatch : MatchBase
    {
        public required Transfer Transfer { get; init; }

        public required bool IsOutgoing { get; init; }

        public override EquivalentAmount GetBalanceDelta(Repositories repositories)
            => new Amounts
            {
                {
                    new Amounts
                    {
                        Transfer.Amount
                    },
                    IsOutgoing
                }
            }.ToEquivalentAmount(repositories);

        public override string ToDetailsNoAmountsOrType(Repositories repositories)
            => Transfer.ToDetailsNoAmountOrDate(repositories);
    }

    public abstract class TransactionBasedMatchBase : MatchBase
    {
        public required Transaction Transaction { get; init; }

        public override string ToDetailsNoAmountsOrType(Repositories repositories)
            => Transaction.ToDetailsNoAmountsOrType(repositories);
    }

    public class PlannedAndActualMatch : ActualMatch
    {
        public required TransactionPlannedAmount Planned { get; init; }
    }

    public class ScheduleAndActualMatch : ActualMatch
    {
        public required PlanSchedule Schedule { get; init; }
        public required Amounts TotalSchedulePlanned { get; set; }
    }

    public class ScheduleRemainderMatch : MatchBase
    {
        public required Plan Plan { get; init; }
        public required EquivalentAmount Remainder { get; init; }
        public required bool IsFull { get; init; }

        public override EquivalentAmount GetBalanceDelta(Repositories repositories)
            => Remainder.Negate(true);

        public override string ToDetailsNoAmountsOrType(Repositories repositories)
            => $"SP-{Plan.Id}";
    }

    public class ActualMatch : TransactionBasedMatchBase
    {
        public required TransactionActualAmount Actual { get; init; }

        public override EquivalentAmount GetBalanceDelta(Repositories repositories)
            => Actual.Amounts.ToEquivalentAmount(repositories).Negate(Transaction.Type == TransactionType.Expense);
    }

    public class PlannedRemainderMatch : TransactionBasedMatchBase
    {
        public required TransactionPlannedAmount Planned { get; init; }
        public required Amounts Remainder { get; init; }

        public override EquivalentAmount GetBalanceDelta(Repositories repositories)
            => Remainder.ToEquivalentAmount(repositories).Negate(Transaction.Type == TransactionType.Expense);
    }

    public class PlannedMatch : TransactionBasedMatchBase
    {
        public required TransactionPlannedAmount Planned { get; init; }

        public override EquivalentAmount GetBalanceDelta(Repositories repositories)
            => Planned.Amounts.ToEquivalentAmount(repositories)
                .Negate(Transaction.Type == TransactionType.Expense);
    }
}