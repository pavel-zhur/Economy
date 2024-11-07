using Economy.Memory.Models.State;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase;

public record Creation(EntityBase Entity) : EventBase;

public record Update(EntityBase Entity) : EventBase;

public record Deletion(string EntityId) : EventBase;