using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Migrations.Serialization;

internal record SerializedEvents(int Version, List<EventBase> Events);