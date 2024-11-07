using Economy.Memory.Models.State;

namespace Economy.Temp;

// Repositories

public interface IRepository<T> where T : EntityBase
{
    Task<T?> GetByIdAsync(string id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(string id);
}

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

public class InMemoryRepository<T> : IRepository<T> where T : EntityBase
{
    private readonly List<T> _entities = new();

    public Task<T?> GetByIdAsync(string id)
    {
        return Task.FromResult(_entities.SingleOrDefault(e => e.Id == id));
    }

    public Task<IReadOnlyList<T>> GetAllAsync()
    {
        return Task.FromResult((IReadOnlyList<T>)_entities);
    }

    public Task<T> AddAsync(T entity)
    {
        _entities.Add(entity);
        return Task.FromResult(entity);
    }

    public Task<T> UpdateAsync(T entity)
    {
        var index = _entities.FindIndex(e => e.Id == entity.Id);
        if (index != -1)
        {
            _entities[index] = entity;
        }
        return Task.FromResult(entity);
    }

    public Task DeleteAsync(string id)
    {
        var entity = _entities.FirstOrDefault(e => e.Id == id);
        if (entity != null)
        {
            _entities.Remove(entity);
        }
        return Task.CompletedTask;
    }
}

public class InMemoryRepositories : IRepositories
{
    public IRepository<Currency> Currencies { get; } = new InMemoryRepository<Currency>();
    public IRepository<Wallet> Wallets { get; } = new InMemoryRepository<Wallet>();
    public IRepository<WalletAudit> WalletAudits { get; } = new InMemoryRepository<WalletAudit>();
    public IRepository<Budget> Budgets { get; } = new InMemoryRepository<Budget>();
    public IRepository<Transaction> Transactions { get; } = new InMemoryRepository<Transaction>();
    public IRepository<Event> Events { get; } = new InMemoryRepository<Event>();
    public IRepository<Category> Categories { get; } = new InMemoryRepository<Category>();
    public IRepository<Conversion> Conversions { get; } = new InMemoryRepository<Conversion>();
    public IRepository<Transfer> Transfers { get; } = new InMemoryRepository<Transfer>();
}