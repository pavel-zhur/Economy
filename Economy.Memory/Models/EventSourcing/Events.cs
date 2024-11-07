using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase(int Id);

public record Creation<T>(int Id, T Entity) : EventBase(Id)
    where T : EntityBase;

public record Update<T>(int Id, T Entity) : EventBase(Id)
    where T : EntityBase;

public record Deletion<T>(int Id, string EntityId) : EventBase(Id)
    where T : EntityBase;