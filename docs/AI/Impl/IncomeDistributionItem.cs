// ViewModels/IncomeDistributionItem.cs

using System;
using System.Collections.Generic;

namespace ViewModels
{
    /// <summary>
    /// Represents the distribution of an income across various plans.
    /// Includes the date of income, source, total amount, plan distributions, and percentages.
    /// </summary>
    public class IncomeDistributionItem
    {
        /// <summary>
        /// The date of the income.
        /// </summary>
        public DateTime IncomeDate { get; set; }

        /// <summary>
        /// The source of the income (e.g., "Зарплата", "Подработка").
        /// </summary>
        public string IncomeSource { get; set; }

        /// <summary>
        /// The total amount of the income.
        /// </summary>
        public decimal IncomeAmount { get; set; }

        /// <summary>
        /// The distributions of the income to various plans.
        /// </summary>
        public List<PlanDistribution> PlanDistributions { get; set; } = new();
    }

    /// <summary>
    /// Represents the distribution of a portion of an income to a plan.
    /// </summary>
    public class PlanDistribution
    {
        /// <summary>
        /// The name of the plan.
        /// </summary>
        public string PlanName { get; set; }

        /// <summary>
        /// The amount distributed to the plan.
        /// </summary>
        public decimal DistributedAmount { get; set; }

        /// <summary>
        /// The percentage of the income distributed to the plan.
        /// </summary>
        public decimal Percentage { get; set; }
    }
}
