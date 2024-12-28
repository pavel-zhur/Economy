// Models.cs

using System;
using System.Collections.Generic;

/// <summary>
/// Organizes financial goals and manages resources. The Plan class is used for budgeting,
/// setting short-term and long-term financial objectives, and forecasting.
/// Plans can include savings funds, planned expenses, and mixed plans that encompass
/// both accumulating and periodic expenditures.
/// </summary>
public class Plan
{
    /// <summary>
    /// Unique identifier of the plan.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the plan, e.g., "Emergency Fund", "Vacation Savings".
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Detailed description or notes about the plan.
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// The type of the plan, indicating its purpose (e.g., Savings, Expense, Mixed).
    /// </summary>
    public PlanType Type { get; set; }

    /// <summary>
    /// The current balance allocated to this plan.
    /// </summary>
    public decimal Balance { get; set; }

    /// <summary>
    /// The target amount or goal for the plan.
    /// </summary>
    public decimal GoalAmount { get; set; }

    /// <summary>
    /// The date by which the plan aims to achieve its goal.
    /// </summary>
    public DateTime? TargetDate { get; set; }

    /// <summary>
    /// Indicates if the plan is active or archived.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// The date the plan was created.
    /// </summary>
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// The date the plan was last modified.
    /// </summary>
    public DateTime ModifiedDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Parent plan for hierarchical grouping. Null if the plan is a top-level plan.
    /// </summary>
    public Guid? ParentPlanId { get; set; }

    /// <summary>
    /// List of child plans if this plan acts as a group.
    /// </summary>
    public List<Plan> SubPlans { get; set; } = new();

    /// <summary>
    /// Allocation rules defining how income is distributed to this plan.
    /// </summary>
    public AllocationRule AllocationRule { get; set; }

    /// <summary>
    /// Associated transactions linked to this plan.
    /// </summary>
    public List<Transaction> Transactions { get; set; } = new();

    /// <summary>
    /// Indicates if the plan automatically spends all incoming funds.
    /// </summary>
    public bool AutoSpendAllIncome { get; set; } = false;

}

/// <summary>
/// Defines the types of plans available.
/// </summary>
public enum PlanType
{
    /// <summary>
    /// A fund intended for saving money over time.
    /// </summary>
    Fund,

    /// <summary>
    /// A storage plan representing holding assets.
    /// </summary>
    Storage,

    /// <summary>
    /// A plan for tracking and managing expenses.
    /// </summary>
    Expense,

    /// <summary>
    /// A combined plan that includes both savings and expenses.
    /// </summary>
    Mixed
}

/// <summary>
/// Represents rules for automatic allocation of income to plans.
/// </summary>
public class AllocationRule
{
    /// <summary>
    /// Determines if the allocation is based on a fixed amount.
    /// </summary>
    public bool IsFixedAmount { get; set; }

    /// <summary>
    /// The fixed amount to allocate if IsFixedAmount is true.
    /// </summary>
    public decimal FixedAmount { get; set; }

    /// <summary>
    /// The percentage of income to allocate if IsFixedAmount is false.
    /// </summary>
    public decimal Percentage { get; set; }

    /// <summary>
    /// Priority of the allocation rule relative to other rules.
    /// </summary>
    public int Priority { get; set; }
}
