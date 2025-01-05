using Economy.Memory.Migrations.EventSourcing;

namespace Economy.Memory.Migrations.Serialization.Ex;

internal record ExSerializedEvents(int Version, IReadOnlyList<ExEventBase> Events, IReadOnlyList<ExBranch> Branches);