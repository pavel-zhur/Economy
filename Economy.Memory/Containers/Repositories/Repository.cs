using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.Repositories;

public class Repository<T>(Repositories repositories, string idPrefix) : IRepository where T : EntityBase
{
    private readonly Dictionary<string, T> _entities = new();
    private int _deletedCount;

    public string GetNextNormalId() => $"{idPrefix}{_entities.Count + _deletedCount + 1}";

    public string IdPrefix => idPrefix;

    public T? GetById(string id)
    {
        return _entities.GetValueOrDefault(id);
    }

    public IEnumerable<T> GetAll()
    {
        return _entities.Values.AsEnumerable();
    }

    public void Add(T entity)
    {
        entity.Validate();

        var nextNormalId = GetNextNormalId();
        if (!entity.Id.StartsWith($"{idPrefix}"))
        {
            throw new InvalidOperationException($"Entity id {entity.Id} prefix is not {idPrefix}.");
        }

        if (entity.Id != nextNormalId)
        {
            throw new InvalidOperationException($"Entity id {entity.Id} is not the next normal id, {nextNormalId} expected.");
        }

        var unresolvedForeignKeys = entity.ForeignKeys.Where(x => repositories.GetRepository(x).GetById(x) == null || x == entity.Id).ToList();
        if (unresolvedForeignKeys.Any())
        {
            throw new InvalidOperationException($"Entity has unresolved foreign keys: {string.Join(", ", unresolvedForeignKeys)}.");
        }

        if (!_entities.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} already exists.");
        }

        foreach (var foreignKey in entity.ForeignKeys.Distinct())
        {
            repositories.AddForeignKey(entity.Id, foreignKey);
        }
    }

    public void Update(T entity)
    {
        entity.Validate();

        if (!_entities.TryGetValue(entity.Id, out var oldEntity))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} does not exist.");
        }

        var unresolvedForeignKeys = entity.ForeignKeys.Where(x => repositories.GetRepository(x).GetById(x) == null || x == entity.Id).ToList();
        if (unresolvedForeignKeys.Any())
        {
            throw new InvalidOperationException($"Entity has unresolved foreign keys: {string.Join(", ", unresolvedForeignKeys)}.");
        }

        ValidateUpdate(oldEntity, entity);

        _entities[entity.Id] = entity;

        foreach (var removeTo in oldEntity.ForeignKeys.Except(entity.ForeignKeys).Distinct())
        {
            repositories.RemoveForeignKey(entity.Id, removeTo);
        }

        foreach (var addTo in entity.ForeignKeys.Except(oldEntity.ForeignKeys).Distinct())
        {
            repositories.AddForeignKey(entity.Id, addTo);
        }
    }

    public void Delete(string id)
    {
        if (repositories.GetIncomingForeignKeysTo(id).Any())
        {
            throw new InvalidOperationException($"Entity with id {id} has incoming foreign keys.");
        }

        if (!_entities.Remove(id))
        {
            throw new InvalidOperationException($"Entity with id {id} does not exist.");
        }

        foreach (var to in repositories.GetOutgoingForeignKeysFrom(id).ToList())
        {
            repositories.RemoveForeignKey(id, to);
        }

        _deletedCount++;
    }

    protected virtual void ValidateUpdate(T oldEntity, T newEntity)
    {
    }

    IEnumerable<EntityBase> IRepository.GetAll() => GetAll();

    void IRepository.Add(EntityBase entity) => Add((T)entity);

    void IRepository.Update(EntityBase entity) => Update((T)entity);

    EntityBase? IRepository.GetById(string id) => GetById(id);
}