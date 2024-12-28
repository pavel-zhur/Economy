// ViewModels/PlanBalanceOverTimeItem.cs

using System;

namespace ViewModels
{
    /// <summary>
    /// Represents the balance of a plan at a specific point in time.
    /// </summary>
    public class PlanBalanceOverTimeItem
    {
        /// <summary>
        /// The date for the balance record.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// The name of the plan.
        /// </summary>
        public string PlanName { get; set; }

        /// <summary>
        /// The balance of the plan on the given date.
        /// </summary>
        public decimal Balance { get; set; }
    }
}
