// Services/InventoryBalanceComparisonService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using ViewModels;

namespace Services
{
    /// <summary>
    /// Service class to create the ViewModel for the fifth view,
    /// fetching and preparing data based on the specified conditions.
    /// </summary>
    public class InventoryBalanceComparisonService
    {
        private readonly Repositories _repositories;

        /// <summary>
        /// Initializes a new instance of the <see cref="InventoryBalanceComparisonService"/> class.
        /// </summary>
        /// <param name="repositories">The repositories containing inventories and transactions.</param>
        public InventoryBalanceComparisonService(Repositories repositories)
        {
            _repositories = repositories;
        }

        /// <summary>
        /// Retrieves the list of inventory balance comparison items.
        /// </summary>
        /// <returns>A list of <see cref="InventoryBalanceComparisonItem"/> instances.</returns>
        public List<InventoryBalanceComparisonItem> GetInventoryBalanceComparisons()
        {
            // Fetch all inventories
            var inventories = _repositories.Inventories.GetAll();

            var comparisonItems = new List<InventoryBalanceComparisonItem>();

            foreach (var inventory in inventories)
            {
                // Calculate the transaction balance up to the inventory date
                decimal transactionBalance = _repositories.Transactions.GetAll()
                    .Where(t => t.Date <= inventory.Date)
                    .Sum(t => t.Type == TransactionType.Income ? t.Amount : -t.Amount);

                var item = new InventoryBalanceComparisonItem
                {
                    InventoryDate = inventory.Date,
                    WalletBalance = inventory.TotalWalletBalance,
                    TransactionBalance = transactionBalance
                };

                comparisonItems.Add(item);
            }

            // Order by inventory date
            return comparisonItems.OrderBy(i => i.InventoryDate).ToList();
        }
    }
}
