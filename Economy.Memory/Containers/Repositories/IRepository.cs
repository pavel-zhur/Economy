using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.Repositories;

public interface IRepository
{
    string GetNextNormalId();
    string IdPrefix { get; }
    EntityBase? TryGetById(string id);
    EntityBase GetById(string id);
    IEnumerable<EntityBase> GetAll();
    void Add(EntityBase entity);
    void Update(EntityBase entity);
    void Delete(string id);
    Type GetEntityType();
}
