namespace Economy.Memory.Models.Branching;

public record Branch(int Id, string? Name, BranchStatus Status, Guid? TipEventId);