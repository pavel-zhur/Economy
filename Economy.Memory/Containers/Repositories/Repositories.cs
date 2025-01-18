using System.Reflection;
using Economy.Memory.Containers.State;
using Economy.Memory.Models;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Tools;
using OneShelf.Common;

namespace Economy.Memory.Containers.Repositories;

public class Repositories : IHistory
{
    private readonly State.State _state;
    private readonly HashSet<(EntityFullId from, EntityFullId to)> _foreignKeys = new();
    private readonly Dictionary<EntityFullId, HashSet<EntityFullId>> _incomingForeignKeysTo = new();
    private readonly Dictionary<EntityFullId, HashSet<EntityFullId>> _outgoingForeignKeysFrom = new();

    internal Repositories(State.State state)
    {
        _state = state;

        Currencies = new(this);
        Wallets = new(this);
        WalletAudits = new(this);
        Plans = new(this);
        Transactions = new(this);
        Events = new(this);
        Categories = new(this);
        Conversions = new(this);
        Transfers = new(this);

        AllByType = new IRepository[]
        {
            Currencies,
            Wallets,
            WalletAudits,
            Plans,
            Transactions,
            Events,
            Categories,
            Conversions,
            Transfers,
        }.ToDictionary(r => r.GetEntityClrType());
        AllByEntityType = AllByType.ToDictionary(x => x.Key.GetCustomAttribute<EntityTypeAttribute>()!.EntityType, x => x.Value);
    }
    
    public Repository<Currency> Currencies { get; }
    public Repository<Wallet> Wallets { get; }
    public Repository<WalletAudit> WalletAudits { get; }
    public PlansRepository Plans { get; }
    public Repository<Transaction> Transactions { get; }
    public Repository<Event> Events { get; }
    public Repository<Category> Categories { get; }
    public Repository<Conversion> Conversions { get; }
    public Repository<Transfer> Transfers { get; }

    public IReadOnlyDictionary<Type, IRepository> AllByType { get; }
    public IReadOnlyDictionary<EntityType, IRepository> AllByEntityType { get; }

    public int Revision => _state.Events.Count;

    public IReadOnlySet<(EntityFullId from, EntityFullId to)> ForeignKeys => _foreignKeys;
    public IEnumerable<EntityFullId> GetIncomingForeignKeysTo(EntityFullId to) => _incomingForeignKeysTo.GetValueOrDefault(to) ?? Enumerable.Empty<EntityFullId>();
    public IEnumerable<EntityFullId> GetOutgoingForeignKeysFrom(EntityFullId from) => _outgoingForeignKeysFrom.GetValueOrDefault(from) ?? Enumerable.Empty<EntityFullId>();

    public IRepository GetRepository(EntityType entityType) => AllByEntityType[entityType];
    public IRepository GetRepository<T>()
        where T : EntityBase
        => AllByType[typeof(T)];

    public EntityBase? TryGetById(EntityFullId entityFullId) => GetRepository(entityFullId.Type).TryGetById(entityFullId.Id);

    (CurrencyCustomDisplayUnit? currencyCustomDisplayUnit, string abbreviation) IHistory.GetCurrencyTitles(
        int currencyId)
        => (Currencies[currencyId].CustomDisplayUnit, Currencies[currencyId].Abbreviation);

    public Details GetDetails(EntityFullId entityFullId) =>
        GetRepository(entityFullId.Type).GetById(entityFullId.Id).ToDetails();

    internal void AddForeignKey(EntityFullId from, EntityFullId to)
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
            incomingList = new();
            _incomingForeignKeysTo[to] = incomingList;
        }

        incomingList.Add(from);

        if (!_outgoingForeignKeysFrom.TryGetValue(from, out var outgoingList))
        {
            outgoingList = new();
            _outgoingForeignKeysFrom[from] = outgoingList;
        }

        outgoingList.Add(to);
    }

    internal void RemoveForeignKey(EntityFullId from, EntityFullId to)
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

    internal void AddFromWithoutValidation(Repositories another)
    {
        if (AllByEntityType.Values.Any(x => x.GetAll().Any())
            || _foreignKeys.Any()
            || _incomingForeignKeysTo.Any()
            || _outgoingForeignKeysFrom.Any())
            throw new InvalidOperationException("Cannot add from another repositories when there are already entities in this repositories.");

        _foreignKeys.AddRange(another._foreignKeys);
        _incomingForeignKeysTo.AddRange(another._incomingForeignKeysTo.Select(x => (x.Key, x.Value.ToHashSet())), false);
        _outgoingForeignKeysFrom.AddRange(another._incomingForeignKeysTo.Select(x => (x.Key, x.Value.ToHashSet())), false);

        foreach (var entityType in AllByEntityType.Keys.Union(another.AllByEntityType.Keys))
        {
            AllByEntityType[entityType].AddFromWithoutValidation(another.AllByEntityType[entityType]);
        }
    }
}