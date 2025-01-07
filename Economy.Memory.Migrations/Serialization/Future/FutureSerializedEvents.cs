using Economy.Memory.Models.Branching;
using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Migrations.Serialization.Future;

internal record FutureSerializedEvents(int Version, IReadOnlyList<EventBase> Events, IReadOnlyList<Branch> Branches);