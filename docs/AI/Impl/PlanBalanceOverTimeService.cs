// Services/PlanBalanceOverTimeService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using ViewModels;

namespace Services
{
    /// <summary>
    /// Service class to calculate the balance of plans over time.
    /// </summary>
    public class PlanBalanceOverTimeService
    {
        private readonly Repositories _repositories;

        public PlanBalanceOverTimeService(Repositories repositories)
        {
            _repositories = repositories;
        }

        /// <summary>
        /// Gets the balance history for all plans over a specified time period.
        /// Assumes all planned incomes and expenses will be executed.
        /// </summary>
        /// <returns>A list of balance records for each plan over time.</returns>
        public List<PlanBalanceOverTimeItem> GetPlanBalancesOverTime()
        {
            // Define the date range for which to calculate balances
            DateTime startDate = DateTime.Today.AddMonths(-6); // Start 6 months ago
            DateTime endDate = DateTime.Today.AddMonths(6);    // End 6 months in the future

            // Get all plans
            var plans = _repositories.Plans.GetAll();

            // Get all transactions (actual and planned)
            var transactions = _repositories.Transactions.GetAll()
                .Where(t => t.Date >= startDate && t.Date <= endDate)
                .OrderBy(t => t.Date)
                .ToList();

            var planBalances = new List<PlanBalanceOverTimeItem>();

            foreach (var plan in plans)
            {
                decimal runningBalance = plan.InitialBalance;

                // Get transactions related to the plan
                var planTransactions = transactions
                    .Where(t => t.PlanId == plan.Id)
                    .OrderBy(t => t.Date)
                    .ToList();

                // Create balance records for each transaction date
                foreach (var transaction in planTransactions)
                {
                    // Update balance based on transaction type
                    if (transaction.Type == TransactionType.Income)
                    {
                        runningBalance += transaction.Amount;
                    }
                    else if (transaction.Type == TransactionType.Expense)
                    {
                        runningBalance -= transaction.Amount;
                    }

                    planBalances.Add(new PlanBalanceOverTimeItem
                    {
                        Date = transaction.Date,
                        PlanName = plan.Name,
                        Balance = runningBalance
                    });
                }
            }

            // Group records by date to fill in missing dates
            var allDates = transactions.Select(t => t.Date).Distinct().OrderBy(d => d).ToList();

            // Ensure each plan has a balance record for each date
            foreach (var date in allDates)
            {
                foreach (var plan in plans)
                {
                    var existingRecord = planBalances
                        .FirstOrDefault(pb => pb.PlanName == plan.Name && pb.Date == date);

                    if (existingRecord == null)
                    {
                        // Find the last known balance before this date
                        var lastBalance = planBalances
                            .Where(pb => pb.PlanName == plan.Name && pb.Date < date)
                            .OrderByDescending(pb => pb.Date)
                            .FirstOrDefault();

                        if (lastBalance != null)
                        {
                            planBalances.Add(new PlanBalanceOverTimeItem
                            {
                                Date = date,
                                PlanName = plan.Name,
                                Balance = lastBalance.Balance
                            });
                        }
                        else
                        {
                            // If no previous balance, use the initial balance
                            planBalances.Add(new PlanBalanceOverTimeItem
                            {
                                Date = date,
                                PlanName = plan.Name,
                                Balance = plan.InitialBalance
                            });
                        }
                    }
                }
            }

            // Order the results
            return planBalances.OrderBy(pb => pb.Date).ToList();
        }
    }
}
