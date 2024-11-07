using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.Repositories;

public interface IRepository
{
    Task<string> GetNextNormalId();
    string IdPrefix { get; }
    Task<EntityBase?> GetById(string id);
    Task<IEnumerable<EntityBase>> GetAll();
    Task Add(EntityBase entity);
    Task Update(EntityBase entity);
    Task Delete(string id);
}