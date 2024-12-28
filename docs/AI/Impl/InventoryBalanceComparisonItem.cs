// ViewModels/InventoryBalanceComparisonItem.cs

using System;

namespace ViewModels
{
    /// <summary>
    /// Represents a comparison between wallet balances from inventory and calculated balances from transactions.
    /// </summary>
    public class InventoryBalanceComparisonItem
    {
        /// <summary>
        /// The date of the inventory.
        /// </summary>
        public DateTime InventoryDate { get; set; }

        /// <summary>
        /// The balance obtained from the wallets during inventory.
        /// </summary>
        public decimal WalletBalance { get; set; }

        /// <summary>
        /// The calculated balance based on transactions up to the inventory date.
        /// </summary>
        public decimal TransactionBalance { get; set; }

        /// <summary>
        /// The difference between wallet balance and transaction balance.
        /// </summary>
        public decimal Difference => WalletBalance - TransactionBalance;

        /// <summary>
        /// Indicates if there is a deviation between balances.
        /// </summary>
        public bool HasDeviation => Difference != 0;
    }
}
