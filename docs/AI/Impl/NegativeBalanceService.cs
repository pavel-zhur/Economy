// Services/NegativeBalanceService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using ViewModels;

namespace Services
{
    /// <summary>
    /// Service to retrieve plans with negative balances and unlinked transactions.
    /// </summary>
    public class NegativeBalanceService
    {
        private readonly Repositories _repositories;

        public NegativeBalanceService(Repositories repositories)
        {
            _repositories = repositories;
        }

        /// <summary>
        /// Gets plans without parent plans that have negative balances.
        /// </summary>
        public List<NegativeBalancePlanItem> GetNegativeBalancePlans()
        {
            var plans = _repositories.Plans.GetAll()
                .Where(p => p.ParentPlanId == null && p.Balance < 0)
                .Select(p => new NegativeBalancePlanItem
                {
                    PlanName = p.Name,
                    Balance = p.Balance,
                    Description = p.Description
                })
                .ToList();

            return plans;
        }

        /// <summary>
        /// Gets transactions that are not linked to any plan.
        /// </summary>
        public List<UnlinkedTransactionItem> GetUnlinkedTransactions()
        {
            var transactions = _repositories.Transactions.GetAll()
                .Where(t => t.PlanId == null)
                .Select(t => new UnlinkedTransactionItem
                {
                    Date = t.Date,
                    Category = t.CategoryName,
                    Amount = t.Amount,
                    Description = t.Description
                })
                .ToList();

            return transactions;
        }

        /// <summary>
        /// Calculates the total negative balance of plans.
        /// </summary>
        public decimal GetTotalNegativeBalance()
        {
            return GetNegativeBalancePlans().Sum(p => p.Balance);
        }

        /// <summary>
        /// Calculates the total amount of unlinked transactions.
        /// </summary>
        public decimal GetTotalUnlinkedTransactionsAmount()
        {
            return GetUnlinkedTransactions().Sum(t => t.Amount);
        }
    }
}
