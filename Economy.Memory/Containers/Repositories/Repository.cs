using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.Repositories;

public class Repository<T>(string idPrefix) : IRepository where T : EntityBase
{
    private readonly Dictionary<string, T> _entities = new();

    public Task<string> GetNextNormalId() => Task.FromResult($"{idPrefix}-{_entities.Count}");

    public string IdPrefix => idPrefix;

    public Task<T?> GetById(string id)
    {
        return Task.FromResult(_entities.GetValueOrDefault(id));
    }

    public Task<IEnumerable<T>> GetAll()
    {
        return Task.FromResult(_entities.Values.AsEnumerable());
    }

    public async Task Add(T entity)
    {
        var nextNormalId = await GetNextNormalId();
        if (!entity.Id.StartsWith($"{idPrefix}-"))
        {
            throw new InvalidOperationException($"Entity id {entity.Id} prefix is not {idPrefix}-.");
        }

        if (entity.Id != nextNormalId)
        {
            throw new InvalidOperationException($"Entity id {entity.Id} is not the next normal id, {nextNormalId} expected.");
        }

        if (!_entities.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} already exists.");
        }
    }

    public Task Update(T entity)
    {
        if (!_entities.ContainsKey(entity.Id))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} does not exist.");
        }

        _entities[entity.Id] = entity;

        return Task.CompletedTask;
    }

    public Task Delete(string id)
    {
        if (!_entities.Remove(id))
        {
            throw new InvalidOperationException($"Entity with id {id} does not exist.");
        }

        return Task.CompletedTask;
    }

    async Task<IEnumerable<EntityBase>> IRepository.GetAll() => await GetAll();

    async Task IRepository.Add(EntityBase entity) => await Add((T)entity);

    async Task IRepository.Update(EntityBase entity) => await Update((T)entity);

    async Task<EntityBase?> IRepository.GetById(string id) => await GetById(id);
}