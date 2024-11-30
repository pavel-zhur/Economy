using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Migrations.Serialization.Future;

internal record FutureSerializedEvents(int Version, List<EventBase> Events);