// ViewModels/ActualFundsDistributionViewModel.cs

using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// ViewModel representing the distribution of actual funds across all active plans.
/// Includes plan name, type, amount, and percentage of the total balance.
/// </summary>
public class ActualFundDistributionItem
{
    /// <summary>
    /// The name of the plan.
    /// </summary>
    public string PlanName { get; set; }

    /// <summary>
    /// The type of the plan (e.g., "Фонд", "Хранилище", "Запланированные").
    /// </summary>
    public string PlanType { get; set; }

    /// <summary>
    /// The amount allocated to the plan.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// The percentage of the total balance allocated to this plan.
    /// </summary>
    public decimal PercentageOfTotal { get; set; }
}

/// <summary>
/// Service class to create the ViewModel for the second view,
/// fetching and preparing data based on the specified conditions.
/// </summary>
public class ActualFundsDistributionService
{
    private readonly Repositories _repositories;

    /// <summary>
    /// Initializes a new instance of the <see cref="ActualFundsDistributionService"/> class.
    /// </summary>
    /// <param name="repositories">The repositories containing plans.</param>
    public ActualFundsDistributionService(Repositories repositories)
    {
        _repositories = repositories;
    }

    /// <summary>
    /// Retrieves the distribution of actual funds across all active plans.
    /// </summary>
    /// <returns>A list of <see cref="ActualFundDistributionItem"/> instances.</returns>
    public List<ActualFundDistributionItem> GetActualFundsDistribution()
    {
        // Fetch all active plans with positive balance and not auto-spending all income.
        var plans = _repositories.Plans.GetAll()
            .Where(plan => plan.IsActive && plan.Balance > 0 && !plan.AutoSpendAllIncome);

        // Calculate total balance across these plans.
        decimal totalBalance = plans.Sum(plan => plan.Balance);

        // Prepare the list of fund distribution items.
        var distributionItems = plans
            .Select(plan => new ActualFundDistributionItem
            {
                PlanName = plan.Name,
                PlanType = GetPlanTypeName(plan),
                Amount = plan.Balance,
                PercentageOfTotal = totalBalance > 0 ? (plan.Balance / totalBalance) * 100 : 0
            })
            .OrderByDescending(item => item.PercentageOfTotal)
            .ToList();

        return distributionItems;
    }

    /// <summary>
    /// Determines the plan type name for display purposes.
    /// </summary>
    /// <param name="plan">The plan to evaluate.</param>
    /// <returns>The display name of the plan type.</returns>
    private string GetPlanTypeName(Plan plan)
    {
        return plan.Type switch
        {
            PlanType.Fund => "Фонд",
            PlanType.Storage => "Хранилище",
            PlanType.Expense => "Запланированные",
            _ => "Неизвестный"
        };
    }
}
