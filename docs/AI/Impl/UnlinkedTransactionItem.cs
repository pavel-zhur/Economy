// ViewModels/UnlinkedTransactionItem.cs

using System;

namespace ViewModels
{
    /// <summary>
    /// Represents a transaction that is not linked to any plan.
    /// </summary>
    public class UnlinkedTransactionItem
    {
        /// <summary>
        /// The date of the transaction.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// The category of the transaction.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// The amount of the transaction.
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// A description of the transaction.
        /// </summary>
        public string Description { get; set; }
    }
}
