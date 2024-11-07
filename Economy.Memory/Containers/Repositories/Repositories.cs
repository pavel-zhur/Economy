using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.Repositories;

public class Repositories
{
    public Repositories()
    {
        AllRepositories = new Dictionary<string, IRepository>
        {
            { Currencies.IdPrefix, Currencies },
            { Wallets.IdPrefix, Wallets },
            { WalletAudits.IdPrefix, WalletAudits },
            { Budgets.IdPrefix, Budgets },
            { Transactions.IdPrefix, Transactions },
            { Events.IdPrefix, Events },
            { Categories.IdPrefix, Categories },
            { Conversions.IdPrefix, Conversions },
            { Transfers.IdPrefix, Transfers }
        };
    }

    public Repository<Currency> Currencies { get; } = new("C");
    public Repository<Wallet> Wallets { get; } = new("W");
    public Repository<WalletAudit> WalletAudits { get; } = new("A");
    public Repository<Budget> Budgets { get; } = new("B");
    public Repository<Transaction> Transactions { get; } = new("Tn");
    public Repository<Event> Events { get; } = new("E");
    public Repository<Category> Categories { get; } = new("Ca");
    public Repository<Conversion> Conversions { get; } = new("Cv");
    public Repository<Transfer> Transfers { get; } = new("Tf");

    public IReadOnlyDictionary<string, IRepository> AllRepositories { get; }
}