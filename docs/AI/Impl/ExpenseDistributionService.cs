// Services/ExpenseDistributionService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using ViewModels;

namespace Services
{
    /// <summary>
    /// Service class to prepare expense data for the fourth view.
    /// </summary>
    public class ExpenseDistributionService
    {
        private readonly Repositories _repositories;

        /// <summary>
        /// Initializes a new instance of the <see cref="ExpenseDistributionService"/> class.
        /// </summary>
        /// <param name="repositories">The repositories containing transactions and plans.</param>
        public ExpenseDistributionService(Repositories repositories)
        {
            _repositories = repositories;
        }

        /// <summary>
        /// Retrieves the expense items.
        /// </summary>
        /// <returns>A list of <see cref="ExpenseItem"/> instances.</returns>
        public List<ExpenseItem> GetExpenses()
        {
            // Fetch all expense transactions
            var expenses = _repositories.Transactions.GetAll()
                .Where(t => t.Type == TransactionType.Expense);

            var expenseItems = expenses.Select(t => new ExpenseItem
            {
                Category = t.CategoryName, // Assuming transaction has CategoryName
                ExpenseDate = t.Date,
                Amount = t.Amount,
                PlanName = t.Plan?.Name // Assuming transaction is associated with a plan
            }).OrderBy(t => t.ExpenseDate).ToList();

            return expenseItems;
        }

        /// <summary>
        /// Calculates the category distributions from the expenses.
        /// </summary>
        /// <returns>A list of <see cref="CategoryDistributionItem"/> instances.</returns>
        public List<CategoryDistributionItem> GetCategoryDistributions()
        {
            var expenses = GetExpenses();

            var totalExpenses = expenses.Sum(e => e.Amount);

            var categoryGroups = expenses.GroupBy(e => e.Category);

            var categoryDistributions = categoryGroups.Select(g => new CategoryDistributionItem
            {
                Category = g.Key,
                TotalAmount = g.Sum(e => e.Amount),
                PercentageOfExpenses = totalExpenses > 0 ? Math.Round((g.Sum(e => e.Amount) / totalExpenses) * 100, 2) : 0
            }).OrderByDescending(c => c.TotalAmount).ToList();

            return categoryDistributions;
        }
    }
}
