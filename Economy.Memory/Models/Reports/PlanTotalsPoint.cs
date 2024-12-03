namespace Economy.Memory.Models.Reports;

public record PlanTotalsPoint(
    decimal Balance,
    decimal SubtreeBalanceSum,
    decimal SubtreeNegativeBalanceSum,
    decimal SubtreePositiveBalanceSum);