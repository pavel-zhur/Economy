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
        WeekStart ??= DayOfWeek.Monday;
        State = await stateFactory.Get();

        From ??= new(2024, 10, 31);
        To ??= new(2025, 3, 31);

        if (To < From) To = From.Value.AddDays(1);

        Row before = new() { Date = From.Value.ToDate().AddDays(-1) };
        Row after = new() { Date = To.Value.ToDate().AddDays(1) };
        var rows = Enumerable.Range(0, (int)(To - From).Value.TotalDays + 1).Select(i => From.Value.AddDays(i)).ToDictionary(x => x.ToDate(), x => new Row
        {
            Date = x.ToDate(),
        });

        foreach (var actualTransaction in State.Repositories.ActualTransactions.GetAll())
        {
            var date = actualTransaction.Timestamp.ToDate();
            var row = rows.GetValueOrDefault(date)
                      ?? (date < From.Value.ToDate() ? before : after);

            (actualTransaction.Type switch
            {
                TransactionType.Expense => row.ActualExpenses,
                TransactionType.Income => row.ActualIncomes,
                _ => throw new ArgumentOutOfRangeException(),
            }).AddRange(actualTransaction.Entries.SelectMany(e => e.Amounts));
        }

        foreach (var plannedTransaction in State.Repositories.PlannedTransactions.GetAll())
        {
            var date = plannedTransaction.Date ?? FindNearestParentBudget(State, plannedTransaction.BudgetId, x => x.StartDate.HasValue).StartDate!.Value;
            var row = rows.GetValueOrDefault(date)
                      ?? (date < From.Value.ToDate() ? before : after);

            (plannedTransaction.Type switch
            {
                TransactionType.Expense => row.PlannedExpenses,
                TransactionType.Income => row.PlannedIncomes,
                _ => throw new ArgumentOutOfRangeException(),
            }).AddRange(plannedTransaction.Amounts);
        }

        Rows.AddRange(rows.Values.Append(before).Append(after).OrderBy(x => x.Date));
    }

    private Budget FindNearestParentBudget(State state, string budgetId, Func<Budget, bool> budgetSelector)
    {
        var budget = state.Repositories.Budgets[budgetId];
        while (!budgetSelector(budget))
        {
            budget = state.Repositories.Budgets[budget.ParentBudgetId!];
        }

        return budget;
    }
}

public class Row
{
    public Date Date { get; init; }
    public List<Amount> ActualExpenses { get; } = new();
    public List<Amount> ActualIncomes { get; } = new();
    public List<Amount> PlannedExpenses { get; } = new();
    public List<Amount> PlannedIncomes { get; } = new();
}