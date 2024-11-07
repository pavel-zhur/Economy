using Economy.Memory.Models.State;

namespace Economy.Memory.Repositories;

public interface IRepository<T> where T : EntityBase
{
    Task<T?> GetByIdAsync(string id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(string id);
    Task<string> GetNextNormalId();
    string IdPrefix { get; }
}