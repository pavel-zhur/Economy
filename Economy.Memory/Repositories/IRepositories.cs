using Economy.Memory.Models.State;

namespace Economy.Memory.Repositories;

public interface IRepositories
{
    IRepository<Currency> Currencies { get; }
    IRepository<Wallet> Wallets { get; }
    IRepository<WalletAudit> WalletAudits { get; }
    IRepository<Budget> Budgets { get; }
    IRepository<Transaction> Transactions { get; }
    IRepository<Event> Events { get; }
    IRepository<Category> Categories { get; }
    IRepository<Conversion> Conversions { get; }
    IRepository<Transfer> Transfers { get; }
}