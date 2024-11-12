using Economy.Migrations.V2.Models.EventSourcing;

namespace Economy.Migrations.V2.Containers.State.Serialization;

internal record SerializedEvents(int Version, List<EventBase> Events);