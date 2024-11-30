using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Containers.Repositories;

public interface IRepository
{
    int GetNextNormalId();

    // todo: refactor all of that in repositories & entities
    EntityBase? TryGetById(int id);
    EntityBase GetById(int id);
    IEnumerable<EntityBase> GetAll();
    void Add(EntityBase entity);
    void Update(EntityBase entity);
    void Delete(int id);
    Type GetEntityClrType();
    EntityType GetEntityType();
}
