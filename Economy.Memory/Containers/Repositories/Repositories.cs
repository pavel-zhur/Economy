using System.Diagnostics.CodeAnalysis;
using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.Repositories;

public class Repositories
{
    private readonly HashSet<(string from, string to)> _foreignKeys = new();
    private readonly Dictionary<string, HashSet<string>> _incomingForeignKeysTo = new();
    private readonly Dictionary<string, HashSet<string>> _outgoingForeignKeysFrom = new();

    public Repositories()
    {
        Currencies = new Repository<Currency>(this, "C-");
        Wallets = new Repository<Wallet>(this, "W-");
        WalletAudits = new Repository<WalletAudit>(this, "A-");
        Budgets = new BudgetsRepository(this, "B-");
        Transactions = new Repository<Transaction>(this, "Tn-");
        Events = new Repository<Event>(this, "E-");
        Categories = new Repository<Category>(this, "Ca-");
        Conversions = new Repository<Conversion>(this, "Cv-");
        Transfers = new Repository<Transfer>(this, "Tf-");

        AllByPrefix = new Dictionary<string, IRepository>
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

    public Repository<Currency> Currencies { get; }
    public Repository<Wallet> Wallets { get; }
    public Repository<WalletAudit> WalletAudits { get; }
    public Repository<Budget> Budgets { get; }
    public Repository<Transaction> Transactions { get; }
    public Repository<Event> Events { get; }
    public Repository<Category> Categories { get; }
    public Repository<Conversion> Conversions { get; }
    public Repository<Transfer> Transfers { get; }

    public IReadOnlyDictionary<string, IRepository> AllByPrefix { get; }

    public IReadOnlySet<(string from, string to)> ForeignKeys => _foreignKeys;
    public IEnumerable<string> GetIncomingForeignKeysTo(string to) => _incomingForeignKeysTo.GetValueOrDefault(to) ?? Enumerable.Empty<string>();
    public IEnumerable<string> GetOutgoingForeignKeysFrom(string from) => _outgoingForeignKeysFrom.GetValueOrDefault(from) ?? Enumerable.Empty<string>();

    public string GetPrefix(string entityId) => entityId[..(entityId.IndexOf("-", StringComparison.Ordinal) + 1)];

    public IRepository GetRepository(string entityId) => AllByPrefix[GetPrefix(entityId)];

    [return: NotNullIfNotNull(nameof(entityId))]
    public EntityBase? GetEntity(string? entityId) => entityId == null ? null : GetRepository(entityId).GetById(entityId);

    [return: NotNullIfNotNull(nameof(entityId))]
    public string? GetReferenceTitle(string? entityId) => entityId == null ? null : GetRepository(entityId).GetById(entityId).ToReferenceTitle(this);

    public EntityBase? TryGetEntity(string? entityId) => entityId == null ? null : GetRepository(entityId).TryGetById(entityId);

    public void AddForeignKey(string from, string to)
    {
        if (from == to)
        {
            throw new InvalidOperationException($"Foreign key from {from} to {to} is not allowed.");
        }

        if (!_foreignKeys.Add((from, to)))
        {
            throw new InvalidOperationException($"Foreign key from {from} to {to} already exists.");
        }

        if (!_incomingForeignKeysTo.TryGetValue(to, out var incomingList))
        {
            incomingList = new HashSet<string>();
            _incomingForeignKeysTo[to] = incomingList;
        }

        incomingList.Add(from);

        if (!_outgoingForeignKeysFrom.TryGetValue(from, out var outgoingList))
        {
            outgoingList = new HashSet<string>();
            _outgoingForeignKeysFrom[from] = outgoingList;
        }

        outgoingList.Add(to);
    }

    public void RemoveForeignKey(string from, string to)
    {
        if (!_foreignKeys.Remove((from, to)))
        {
            throw new KeyNotFoundException($"Foreign key from {from} to {to} does not exist.");
        }

        var incomingList = _incomingForeignKeysTo[to];
        incomingList.Remove(from);
        if (incomingList.Count == 0)
        {
            _incomingForeignKeysTo.Remove(to);
        }

        var outgoingList = _outgoingForeignKeysFrom[from];
        outgoingList.Remove(to);
        if (outgoingList.Count == 0)
        {
            _outgoingForeignKeysFrom.Remove(from);
        }
    }
}