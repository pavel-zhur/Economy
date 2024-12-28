// ViewModels/PlannedExpensesViewModel.cs

using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// ViewModel representing a planned expense for display in the first view.
/// Includes date, category (plan name), amount, and status ("Не выполнен", "Просрочен").
/// </summary>
public class PlannedExpenseViewModel
{
    /// <summary>
    /// The date of the planned expense.
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// The category or name of the plan associated with the expense.
    /// </summary>
    public string Category { get; set; }

    /// <summary>
    /// The amount allocated for the planned expense.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// The status of the planned expense ("Не выполнен" or "Просрочен").
    /// </summary>
    public string Status { get; set; }
}

/// <summary>
/// Service class to create the ViewModel for the first view,
/// fetching and preparing data based on the specified conditions.
/// </summary>
public class PlannedExpensesViewService
{
    private readonly Repositories _repositories;

    /// <summary>
    /// Initializes a new instance of the <see cref="PlannedExpensesViewService"/> class.
    /// </summary>
    /// <param name="repositories">The repositories containing plans and transactions.</param>
    public PlannedExpensesViewService(Repositories repositories)
    {
        _repositories = repositories;
    }

    /// <summary>
    /// Retrieves the list of planned expenses to display in the first view.
    /// </summary>
    /// <returns>A list of <see cref="PlannedExpenseViewModel"/> instances.</returns>
    public List<PlannedExpenseViewModel> GetPlannedExpenses()
    {
        var today = DateTime.Today;

        // Fetch all active expense plans that have actual funds.
        var plannedExpenses = _repositories.Plans.GetAll()
            .Where(plan => plan.IsActive && plan.Type == PlanType.Expense)
            .Select(plan => new
            {
                Plan = plan,
                AmountAllocated = plan.Balance,
                ExpectedDate = GetExpectedDate(plan)
            })
            .Where(x => x.AmountAllocated > 0 && x.ExpectedDate != null)
            .Select(x => new PlannedExpenseViewModel
            {
                Date = x.ExpectedDate.Value,
                Category = x.Plan.Name,
                Amount = x.Plan.GoalAmount,
                Status = x.ExpectedDate < today ? "Просрочен" : "Не выполнен"
            })
            .OrderBy(x => x.Date)
            .ToList();

        return plannedExpenses;
    }

    /// <summary>
    /// Determines the expected date of the plan, prioritizing the planned date over the target date.
    /// </summary>
    /// <param name="plan">The plan to evaluate.</param>
    /// <returns>The expected date if available; otherwise, null.</returns>
    private DateTime? GetExpectedDate(Plan plan)
    {
        if (plan.ExpectedFinancialActivity?.PlannedDate != null)
        {
            return plan.ExpectedFinancialActivity.PlannedDate.Value.ToDateTime();
        }
        if (plan.TargetDate != null)
        {
            return plan.TargetDate.Value;
        }
        return null;
    }
}

/// <summary>
/// Extension methods for converting custom date structures to DateTime.
/// </summary>
public static class DateExtensions
{
    /// <summary>
    /// Converts a custom <see cref="Date"/> to a <see cref="DateTime"/> instance.
    /// </summary>
    /// <param name="date">The custom date structure.</param>
    /// <returns>A <see cref="DateTime"/> representing the same date.</returns>
    public static DateTime ToDateTime(this Date date)
    {
        return new DateTime(date.Year, date.Month, date.Day);
    }
}
