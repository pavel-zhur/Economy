// Services/FutureFundsDistributionService.cs

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

/// <summary>
/// Service class to create the ViewModel for the third view,
/// fetching and preparing data based on the specified conditions.
/// </summary>
public class FutureFundsDistributionService
{
    private readonly Repositories _repositories;

    /// <summary>
    /// Initializes a new instance of the <see cref="FutureFundsDistributionService"/> class.
    /// </summary>
    /// <param name="repositories">The repositories containing plans and transactions.</param>
    public FutureFundsDistributionService(Repositories repositories)
    {
        _repositories = repositories;
    }

    /// <summary>
    /// Retrieves the future funds distribution over a specified number of periods.
    /// </summary>
    /// <param name="startDate">The start date for the periods.</param>
    /// <param name="numberOfPeriods">The number of periods to project.</param>
    /// <returns>A list of <see cref="FutureFundsDistributionItem"/> instances.</returns>
    public List<FutureFundsDistributionItem> GetFutureFundsDistribution(DateTime startDate, int numberOfPeriods)
    {
        var items = new List<FutureFundsDistributionItem>();

        // Define the plans to include, excluding specific types as per conditions
        var plans = _repositories.Plans.GetAll()
            .Where(plan => !plan.AutoSpendAllIncome && !IsPlannedIncome(plan) && !IsPlannedExpense(plan))
            .ToList();

        // Get current balances for the plans
        var currentBalances = plans.ToDictionary(plan => plan.Name, plan => plan.Balance);

        // Assume periods are monthly
        var periodDate = new DateTime(startDate.Year, startDate.Month, 1);

        for (int i = 0; i < numberOfPeriods; i++)
        {
            var periodStart = periodDate.AddMonths(i);
            var periodEnd = periodStart.AddMonths(1).AddDays(-1);

            var periodName = periodStart.ToString("MMMM yyyy", new CultureInfo("ru-RU"));

            // Projected plan balances for the period
            var planBalances = new Dictionary<string, decimal>();

            // For each plan, calculate the projected balance
            foreach (var plan in plans)
            {
                // Here we should apply real projection logic involving expected incomes and allocation rules
                // For simplicity, assume a 5% increase each month
                decimal projectedBalance = currentBalances[plan.Name] * (1 + 0.05m * i);

                planBalances[plan.Name] = projectedBalance;
            }

            // Calculate minimum goal and goal point for the period
            decimal totalProjectedBalance = planBalances.Values.Sum();
            decimal minimumGoal = totalProjectedBalance * 0.9m; // Assume minimum goal is 90% of total
            decimal goalPoint = totalProjectedBalance; // Assume goal point is the total of plan balances

            var item = new FutureFundsDistributionItem
            {
                Period = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(periodName),
                PlanBalances = new Dictionary<string, decimal>(planBalances),
                MinimumGoal = minimumGoal,
                GoalPoint = goalPoint
            };

            items.Add(item);
        }

        return items;
    }

    /// <summary>
    /// Determines if a plan is a planned income.
    /// </summary>
    private bool IsPlannedIncome(Plan plan)
    {
        // Implement logic to determine if a plan is a planned income
        return plan.Type == PlanType.Income;
    }

    /// <summary>
    /// Determines if a plan is a planned expense.
    /// </summary>
    private bool IsPlannedExpense(Plan plan)
    {
        // Implement logic to determine if a plan is a planned expense
        return plan.Type == PlanType.Expense && plan.ExpectedFinancialActivity != null;
    }
}
