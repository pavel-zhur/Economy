using Economy.Memory.Models;
using Economy.Memory.Models.State;
using System.Reflection;
using Economy.Memory.Tools;

namespace Economy.Memory.Containers.Repositories;

public class Repository<T>(Repositories repositories) : IRepository where T : EntityBase
{
    private readonly Dictionary<int, T> _entities = new();
    private int _deletedCount;

    public Type GetEntityClrType() => typeof(T);

    public EntityType GetEntityType() => GetEntityClrType().GetCustomAttribute<EntityTypeAttribute>()!.EntityType;

    public int GetNextNormalId() => _entities.Count + _deletedCount + 1;
    
    public T? TryGetById(int id)
    {
        return _entities.GetValueOrDefault(id);
    }

    public T this[int id] => _entities[id];

    public IEnumerable<T> GetAll()
    {
        return _entities.Values.AsEnumerable();
    }

    public void Add(T entity)
    {
        entity.Validate(repositories);

        var nextNormalId = GetNextNormalId();

        if (entity.Id != nextNormalId)
        {
            throw new InvalidOperationException($"Entity id {entity.Id} is not the next normal id, {nextNormalId} expected.");
        }

        var unresolvedForeignKeys = entity.GetForeignKeys().Where(x => repositories.GetRepository(x.Type).TryGetById(x.Id) == null || x == new EntityFullId(GetEntityType(), entity.Id)).ToList();
        if (unresolvedForeignKeys.Any())
        {
            throw new InvalidOperationException($"Entity has unresolved foreign keys: {string.Join(", ", unresolvedForeignKeys)}.");
        }

        if (!_entities.TryAdd(entity.Id, entity))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} already exists.");
        }

        foreach (var foreignKey in entity.GetForeignKeys())
        {
            repositories.AddForeignKey(entity.GetFullId(), foreignKey);
        }
    }

    public void Update(T entity)
    {
        entity.Validate(repositories);

        if (!_entities.TryGetValue(entity.Id, out var oldEntity))
        {
            throw new InvalidOperationException($"Entity with id {entity.Id} does not exist.");
        }

        var unresolvedForeignKeys = entity.GetForeignKeys().Where(x => repositories.TryGetById(x) == null || x == entity.GetFullId()).ToList();
        if (unresolvedForeignKeys.Any())
        {
            throw new InvalidOperationException($"Entity has unresolved foreign keys: {string.Join(", ", unresolvedForeignKeys)}.");
        }

        ValidateUpdate(oldEntity, entity);

        _entities[entity.Id] = entity;

        foreach (var removeTo in oldEntity.GetForeignKeys().Except(entity.GetForeignKeys()))
        {
            repositories.RemoveForeignKey(entity.GetFullId(), removeTo);
        }

        foreach (var addTo in entity.GetForeignKeys().Except(oldEntity.GetForeignKeys()))
        {
            repositories.AddForeignKey(entity.GetFullId(), addTo);
        }
    }

    public void Delete(int id)
    {
        var entityFullId = id.ToEntityFullId(GetEntityType());

        if (repositories.GetIncomingForeignKeysTo(entityFullId).Any())
        {
            throw new InvalidOperationException($"Entity with id {id} has incoming foreign keys.");
        }

        if (!_entities.Remove(id))
        {
            throw new InvalidOperationException($"Entity with id {id} does not exist.");
        }

        foreach (var to in repositories.GetOutgoingForeignKeysFrom(entityFullId).ToList())
        {
            repositories.RemoveForeignKey(entityFullId, to);
        }

        _deletedCount++;
    }

    protected virtual void ValidateUpdate(T oldEntity, T newEntity)
    {
    }

    IEnumerable<EntityBase> IRepository.GetAll() => GetAll();

    void IRepository.Add(EntityBase entity) => Add((T)entity);

    void IRepository.Update(EntityBase entity) => Update((T)entity);

    EntityBase? IRepository.TryGetById(int id) => TryGetById(id);

    EntityBase IRepository.GetById(int id) => this[id];
}