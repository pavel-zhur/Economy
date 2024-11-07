using Economy.Memory.Models.State;

namespace Economy.Memory.Repositories;

public class Repository<T>(string idPrefix) : IRepository<T> where T : EntityBase
{
    private readonly Dictionary<string, T> _entities = new();

    public Task<string> GetNextNormalId() => Task.FromResult($"{idPrefix}-{_entities.Count}");

    public string IdPrefix => idPrefix;

    public Task<T?> GetByIdAsync(string id)
    {
        return Task.FromResult(_entities.GetValueOrDefault(id));
    }

    public Task<IEnumerable<T>> GetAllAsync()
    {
        return Task.FromResult(_entities.Values.AsEnumerable());
    }

    public async Task AddAsync(T entity)
    {
        var nextNormalId = await GetNextNormalId();
        if (entity.Id != nextNormalId)
        {
            throw new InvalidOperationException($"Entity id {entity.Id} is not the next normal id, {nextNormalId} expected.");
        }

        if (!_entities.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} already exists.");
        }
    }

    public Task UpdateAsync(T entity)
    {
        if (!_entities.ContainsKey(entity.Id))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} does not exist.");
        }

        _entities[entity.Id] = entity;

        return Task.CompletedTask;
    }

    public Task DeleteAsync(string id)
    {
        if (!_entities.Remove(id))
        {
            throw new InvalidOperationException($"Entity with id {id} does not exist.");
        }

        return Task.CompletedTask;
    }
}