using Economy.Memory.Models.Branching;

namespace Economy.Memory.Migrations.EventSourcing;

public record ExBranch(int Id, string? Name, BranchStatus Status, Guid? TipEventId);