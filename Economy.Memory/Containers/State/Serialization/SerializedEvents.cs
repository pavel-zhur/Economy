using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Containers.State.Serialization;

internal record SerializedEvents(int Version, List<EventBase> Events);