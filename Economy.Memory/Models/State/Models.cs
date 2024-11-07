namespace Economy.Memory.Models.State;

public record EntityBase(string Id);

// Root entities

public record Currency(string Id, string LongName, string Abbreviation, string CurrencySymbol) : EntityBase(Id);

public record Wallet(string Id, string Name) : EntityBase(Id);

public record Event(string Id, string Name, string? Description, int? BudgetId, Date Date) : EntityBase(Id);

public record Category(string Id, string Name, string? Description) : EntityBase(Id);

public record WalletAudit(string Id, int WalletId, DateTime CheckTimestamp, IReadOnlyList<Amount> Amounts) : EntityBase(Id);

public record Budget(
    string Id,
    string? Name,
    string? Description,
    int? ParentBudgetId,
    Date? StartDate,
    Date? FinishDate,
    BudgetPlannedAmounts? PlannedAmounts)
    : EntityBase(Id);

public record Transaction(
    string Id,
    string Name,
    string? Description,
    DateTime Timestamp,
    TransactionType Type,
    IReadOnlyList<TransactionEntry> FromBudgets)
    : EntityBase(Id);

public record Conversion(
    string Id,
    int FromWalletId,
    Amount FromAmount,
    int ToWalletId,
    Amount ToAmount)
    : EntityBase(Id);

public record Transfer(
    string Id,
    int FromBudgetId,
    int ToBudgetId,
    Amount TransferredAmount,
    Date Date,
    TransferType TransferType,
    Amount? ConvertedAmount)
    : EntityBase(Id);

// Sub-entities

public record TransactionEntry(
    int? BudgetId,
    int? CategoryId,
    int? WalletId,
    string? Description,
    IReadOnlyList<Amount> SpentAmounts);

public record BudgetPlannedAmounts(
    IReadOnlyList<Amount> Amounts,
    TransactionType Type,
    bool IsCompleted);

// Value objects

public enum TransferType
{
    Reallocation,
    Usage,
}

public enum TransactionType
{
    Income,
    Expense,
}

public record struct Amount(int CurrencyId, decimal Value);

public record struct Date(int Year, int Month, int Day);
