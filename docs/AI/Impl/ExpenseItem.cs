// ViewModels/ExpenseItem.cs

using System;

namespace ViewModels
{
    /// <summary>
    /// Represents an expense transaction with its category, date, amount, and associated plan.
    /// </summary>
    public class ExpenseItem
    {
        /// <summary>
        /// The category of the expense.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// The date of the expense.
        /// </summary>
        public DateTime ExpenseDate { get; set; }

        /// <summary>
        /// The amount of the expense.
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// The plan associated with the expense.
        /// </summary>
        public string PlanName { get; set; }
    }
}
