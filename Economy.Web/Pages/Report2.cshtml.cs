using Economy.AiInterface.Scope;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages
{
    public class Report2Model(StateFactory stateFactory) : PageModel
    {
        public State State { get; set; } = null!;
        public Amounts TotalIncomes { get; set; } = null!;
        public Amounts TotalExpenses { get; set; } = null!;
        public Amounts Total { get; set; } = null!;

        public async Task OnGet()
        {
            State = await stateFactory.Get();

            TotalIncomes = CreateTotal(TransactionType.Income);
            TotalExpenses = CreateTotal(TransactionType.Expense);

            Total = new Amounts
            {
                TotalIncomes,
                { TotalExpenses, true }
            };
        }
        
        private Amounts CreateTotal(TransactionType transactionType)
        {
            var result = new Amounts();
            foreach (var transaction in State.Repositories.Transactions.GetAll().Where(x => x.Type == transactionType))
            {
                foreach (var transactionEntry in transaction.Entries)
                {
                    result.Add(transactionEntry.Amounts);
                }
            }

            return result;
        }
    }
}
