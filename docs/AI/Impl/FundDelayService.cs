// Services/FundDelayService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using ViewModels;

namespace Services
{
    /// <summary>
    /// Service class to calculate the delays between income reception and fund usage.
    /// </summary>
    public class FundDelayService
    {
        private readonly Repositories _repositories;

        /// <summary>
        /// Initializes a new instance of the <see cref="FundDelayService"/> class.
        /// </summary>
        /// <param name="repositories">The repositories containing transactions.</param>
        public FundDelayService(Repositories repositories)
        {
            _repositories = repositories;
        }

        /// <summary>
        /// Retrieves the list of fund delay items using only actual incomes and expenses.
        /// </summary>
        /// <returns>A list of <see cref="FundDelayItem"/> instances.</returns>
        public List<FundDelayItem> GetFundDelays()
        {
            // Fetch all actual incomes
            var incomes = _repositories.Transactions.GetAll()
                .Where(t => t.Type == TransactionType.Income && t.IsActual)
                .OrderBy(t => t.Date);

            var expenses = _repositories.Transactions.GetAll()
                .Where(t => t.Type == TransactionType.Expense && t.IsActual)
                .OrderBy(t => t.Date)
                .ToList();

            var fundDelayItems = new List<FundDelayItem>();

            foreach (var income in incomes)
            {
                // Find expenses that occurred after the income date
                var subsequentExpenses = expenses.Where(e => e.Date >= income.Date).ToList();

                if (subsequentExpenses.Any())
                {
                    // Calculate the delay days for each expense until the next income
                    var nextIncomeDate = incomes.Where(i => i.Date > income.Date).Select(i => i.Date).FirstOrDefault(DateTime.MaxValue);
                    var expensesUntilNextIncome = subsequentExpenses.Where(e => e.Date < nextIncomeDate).ToList();

                    foreach (var expense in expensesUntilNextIncome)
                    {
                        var delayDays = (expense.Date - income.Date).Days;

                        var item = new FundDelayItem
                        {
                            IncomeDate = income.Date,
                            DelayDays = delayDays
                        };

                        fundDelayItems.Add(item);
                    }

                    // Remove considered expenses to avoid duplication
                    expenses.RemoveAll(e => expensesUntilNextIncome.Contains(e));
                }
            }

            return fundDelayItems.OrderBy(item => item.IncomeDate).ToList();
        }
    }
}
