using Economy.Migrations.V2.Models.State;

namespace Economy.Migrations.V2.Containers.Repositories;

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
