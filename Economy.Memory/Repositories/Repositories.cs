using Economy.Memory.Models.State;

namespace Economy.Memory.Repositories;

public class Repositories : IRepositories
{
    public IRepository<Currency> Currencies { get; } = new Repository<Currency>("C");
    public IRepository<Wallet> Wallets { get; } = new Repository<Wallet>("W");
    public IRepository<WalletAudit> WalletAudits { get; } = new Repository<WalletAudit>("A");
    public IRepository<Budget> Budgets { get; } = new Repository<Budget>("B");
    public IRepository<Transaction> Transactions { get; } = new Repository<Transaction>("Tn");
    public IRepository<Event> Events { get; } = new Repository<Event>("E");
    public IRepository<Category> Categories { get; } = new Repository<Category>("Ca");
    public IRepository<Conversion> Conversions { get; } = new Repository<Conversion>("Cv");
    public IRepository<Transfer> Transfers { get; } = new Repository<Transfer>("Tf");
}