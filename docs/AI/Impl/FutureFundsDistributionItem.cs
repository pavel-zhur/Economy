// ViewModels/FutureFundsDistributionItem.cs

using System;
using System.Collections.Generic;

/// <summary>
/// Represents the future distribution of funds across savings and funds for a specific period.
/// Includes plan balances, minimum goals, and goal points.
/// </summary>
public class FutureFundsDistributionItem
{
    /// <summary>
    /// The period represented as a string (e.g., "январь 2024").
    /// </summary>
    public string Period { get; set; }

    /// <summary>
    /// The balances of each plan for the period.
    /// Key: Plan Name, Value: Projected Balance.
    /// </summary>
    public Dictionary<string, decimal> PlanBalances { get; set; }

    /// <summary>
    /// The total minimum pessimistic goal for the period.
    /// </summary>
    public decimal MinimumGoal { get; set; }

    /// <summary>
    /// The goal point for the period.
    /// </summary>
    public decimal GoalPoint { get; set; }
}
