// Services/IncomeDistributionService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using ViewModels;

namespace Services
{
    /// <summary>
    /// Service class to create the ViewModel for the fourth view,
    /// fetching and preparing data based on the specified conditions.
    /// </summary>
    public class IncomeDistributionService
    {
        private readonly Repositories _repositories;

        /// <summary>
        /// Initializes a new instance of the <see cref="IncomeDistributionService"/> class.
        /// </summary>
        /// <param name="repositories">The repositories containing transactions, plans, and allocations.</param>
        public IncomeDistributionService(Repositories repositories)
        {
            _repositories = repositories;
        }

        /// <summary>
        /// Retrieves the income distributions for past and future incomes.
        /// </summary>
        /// <returns>A list of <see cref="IncomeDistributionItem"/> instances.</returns>
        public List<IncomeDistributionItem> GetIncomeDistributions()
        {
            // Fetch all income transactions (both actual and planned)
            var incomes = _repositories.Transactions.GetAll()
                .Where(t => t.Type == TransactionType.Income);

            var result = new List<IncomeDistributionItem>();

            foreach (var income in incomes)
            {
                // Get the allocations (distributions) for this income
                var allocations = _repositories.Allocations.GetByTransactionId(income.Id);

                // Prepare plan distributions
                var planDistributions = allocations.Select(a => new PlanDistribution
                {
                    PlanName = a.Plan.Name,
                    DistributedAmount = a.Amount,
                    Percentage = income.Amount > 0 ? Math.Round((a.Amount / income.Amount) * 100, 2) : 0
                }).ToList();

                var incomeItem = new IncomeDistributionItem
                {
                    IncomeDate = income.Date,
                    IncomeSource = income.SourceName, // Assuming there's a SourceName property.
                    IncomeAmount = income.Amount,
                    PlanDistributions = planDistributions
                };

                result.Add(incomeItem);
            }

            return result.OrderBy(i => i.IncomeDate).ToList();
        }
    }
}
