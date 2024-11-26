using Economy.Engine;
using Economy.Memory.Containers.State;
using Economy.Memory.Models;
using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages
{
    public class Report2Model(StateFactory<State> stateFactory) : PageModel
    {
        public State State { get; set; } = null!;
        public Amounts TotalIncomes { get; set; } = null!;
        public Amounts TotalExpenses { get; set; } = null!;
        public Amounts Total { get; set; } = null!;

        public EquivalentAmount TotalIncomesEquivalent { get; set; } = null!;
        public EquivalentAmount TotalExpensesEquivalent { get; set; } = null!;
        public EquivalentAmount TotalEquivalent { get; set; } = null!;
        
        public async Task OnGet()
        {
            State = await stateFactory.GetState();

            TotalIncomes = CreateTotal(TransactionType.Income);
            TotalExpenses = CreateTotal(TransactionType.Expense);

            Total = new Amounts
            {
                TotalIncomes,
                { TotalExpenses, true }
            };

            TotalIncomesEquivalent = TotalIncomes.ToEquivalentAmount(State.Repositories);
            TotalExpensesEquivalent = TotalExpenses.ToEquivalentAmount(State.Repositories);
            TotalEquivalent = Total.ToEquivalentAmount(State.Repositories);
        }
        
        private Amounts CreateTotal(TransactionType transactionType)
        {
            var result = new Amounts();
            foreach (var transaction in State.Repositories.Transactions.GetAll().Where(x => x.Type == transactionType))
            {
                result.Add(transaction.Amounts);
            }

            return result;
        }
    }
}
