using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.State;

public class StateFactory
{
    public State CreateState()
    {
        var state = new State();

        // Create and apply events for the first category
        var deletedCategory1 = new Category(state.Repositories.Categories.GetNextNormalId(), "Groceries", "Monthly shopping");
        state.Apply(new Creation(deletedCategory1));
        state.Apply(new Update(deletedCategory1 with
        {
            Name = "Groceries & Food",
            Description = "Monthly shopping and food"
        }));
        state.Apply(new Deletion(deletedCategory1.Id));

        // Create and apply events for the second category
        var category2 = new Category(state.Repositories.Categories.GetNextNormalId(), "Utilities", "Monthly bills");
        state.Apply(new Creation(category2));
        state.Apply(new Update(category2 with
        {
            Name = "Utilities & Bills",
            Description = "Monthly bills and other expenses"
        }));

        // Create and apply events for the third category
        var category3 = new Category(state.Repositories.Categories.GetNextNormalId(), "Entertainment", "Monthly expenses");
        state.Apply(new Creation(category3));

        // Create and apply events for the fourth category
        var category4 = new Category(state.Repositories.Categories.GetNextNormalId(), "Healthcare", "Monthly expenses");
        state.Apply(new Creation(category4));

        // Create and apply events for the fifth category
        var category5 = new Category(state.Repositories.Categories.GetNextNormalId(), "Education", "Monthly expenses");
        state.Apply(new Creation(category5));

        // add wallets
        var wallet1 = new Wallet(state.Repositories.Wallets.GetNextNormalId(), "Main");
        state.Apply(new Creation(wallet1));
        var wallet2 = new Wallet(state.Repositories.Wallets.GetNextNormalId(), "Savings");
        state.Apply(new Creation(wallet2));
        var wallet3 = new Wallet(state.Repositories.Wallets.GetNextNormalId(), "Travel");
        state.Apply(new Creation(wallet3));

        // add currencies
        var currency1 = new Currency(state.Repositories.Currencies.GetNextNormalId(), "US Dollar", "USD", '$');
        state.Apply(new Creation(currency1));
        var currency2 = new Currency(state.Repositories.Currencies.GetNextNormalId(), "Euro", "EUR", '€');
        state.Apply(new Creation(currency2));
        var currency3 = new Currency(state.Repositories.Currencies.GetNextNormalId(), "British Pound", "GBP", '£');
        state.Apply(new Creation(currency3));

        // add budgets
        var budget1 = new Budget(state.Repositories.Budgets.GetNextNormalId(), "Household", "For household expenses", ParentBudgetId: null, StartDate: new Date(2024, 03, 02), FinishDate: null, null);
        state.Apply(new Creation(budget1));

        var budget2 = new Budget(state.Repositories.Budgets.GetNextNormalId(), "Vacation", "For vacation expenses", ParentBudgetId: budget1.Id, StartDate: new Date(2024, 05, 05), FinishDate: new Date(2024, 08, 11), null);
        state.Apply(new Creation(budget2));

        var budget3 = new Budget(state.Repositories.Budgets.GetNextNormalId(), "Education", "For education expenses", ParentBudgetId: budget1.Id, StartDate: null, FinishDate: null, new BudgetPlannedAmounts(new Amounts { new(currency3.Id, 500) }, TransactionType.Expense, false));
        state.Apply(new Creation(budget3));

        var walletAudit1 = new WalletAudit(state.Repositories.WalletAudits.GetNextNormalId(), wallet1.Id, new DateTime(2024, 05, 05), new Amounts { new(currency1.Id, 13), new(currency2.Id, 4000) });
        state.Apply(new Creation(walletAudit1));

        var walletAudit2 = new WalletAudit(state.Repositories.WalletAudits.GetNextNormalId(), wallet2.Id, new DateTime(2024, 05, 05), new Amounts { new(currency2.Id, 4000), new(currency3.Id, 500) });
        state.Apply(new Creation(walletAudit2));

        var walletAudit3 = new WalletAudit(state.Repositories.WalletAudits.GetNextNormalId(), wallet3.Id, new DateTime(2024, 05, 05), new Amounts { new(currency1.Id, 13), new(currency3.Id, 500) });
        state.Apply(new Creation(walletAudit3));

        var event1 = new Event(state.Repositories.Events.GetNextNormalId(), "Annual Conference", "Business conference", budget1.Id, new(2024, 08, 11));
        state.Apply(new Creation(event1));

        var event2 = new Event(state.Repositories.Events.GetNextNormalId(), "Team Building Retreat", "Activities and workshops", budget2.Id, new(2024, 09, 12));
        state.Apply(new Creation(event2));

        // new transaction
        var transaction1 = new Transaction(state.Repositories.Transactions.GetNextNormalId(), "Grocery Shopping", "Weekly shopping", DateTime.Now, TransactionType.Expense, new List<TransactionEntry> { new TransactionEntry(budget1.Id, category3.Id, wallet1.Id, "Store purchase", new Amounts { new(currency1.Id, 33) }) });
        state.Apply(new Creation(transaction1));

        // new transaction
        var transaction2 = new Transaction(state.Repositories.Transactions.GetNextNormalId(), "Utility Bill Payment", "Monthly bill payment", DateTime.Now, TransactionType.Income, new List<TransactionEntry> { new TransactionEntry(budget2.Id, category2.Id, wallet2.Id, "Electricity bill", new Amounts { new(currency2.Id, 33), new(currency1.Id, 330) }) });
        state.Apply(new Creation(transaction2));

        // new transaction
        var transaction3 = new Transaction(state.Repositories.Transactions.GetNextNormalId(), "Doctor Visit", "Routine check-up", DateTime.Now, TransactionType.Expense, new List<TransactionEntry> { new TransactionEntry(budget3.Id, category4.Id, wallet3.Id, "Consultation fee", new Amounts { new(currency3.Id, 50) }) });
        state.Apply(new Creation(transaction3));

        // new conversion
        var conversion1 = new Conversion(state.Repositories.Conversions.GetNextNormalId(), wallet1.Id, new(currency1.Id, 13), wallet2.Id, new(currency2.Id, 4000));
        state.Apply(new Creation(conversion1));

        // new conversion
        var conversion2 = new Conversion(state.Repositories.Conversions.GetNextNormalId(), wallet2.Id, new(currency2.Id, 4000), wallet1.Id, new(currency1.Id, 55));
        state.Apply(new Creation(conversion2));

        // new conversion
        var conversion3 = new Conversion(state.Repositories.Conversions.GetNextNormalId(), wallet3.Id, new(currency3.Id, 500), wallet1.Id, new(currency1.Id, 100));
        state.Apply(new Creation(conversion3));

        // new transfer
        var transfer1 = new Transfer(state.Repositories.Transfers.GetNextNormalId(), budget1.Id, budget2.Id, new(currency2.Id, 4000), new(2024, 05, 05), TransferType.Reallocation, new(currency1.Id, 55));
        state.Apply(new Creation(transfer1));

        // new transfer
        var transfer2 = new Transfer(state.Repositories.Transfers.GetNextNormalId(), budget2.Id, budget3.Id, new(currency3.Id, 500), new(2024, 06, 06), TransferType.Usage, null);
        state.Apply(new Creation(transfer2));

        return state;
    }
}
