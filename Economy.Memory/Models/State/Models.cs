using OneShelf.Common;

namespace Economy.Memory.Models.State;

public abstract record EntityBase(string Id)
{
    public virtual IEnumerable<string> ForeignKeys => Enumerable.Empty<string>();
}

// Root entities

public record Currency(string Id, string LongName, string Abbreviation, string CurrencySymbol) : EntityBase(Id);

public record Wallet(string Id, string Name) : EntityBase(Id);

public record Event(string Id, string Name, string? Description, string? BudgetId, Date Date) : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys => BudgetId.Once().Where(x => x != null)!;
}

public record Category(string Id, string Name, string? Description) : EntityBase(Id);

public record WalletAudit(string Id, string WalletId, DateTime CheckTimestamp, IReadOnlyList<Amount> Amounts) : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys => Amounts.Select(a => a.CurrencyId).Append(WalletId);
}

public record Budget(
    string Id,
    string? Name,
    string? Description,
    string? ParentBudgetId,
    Date? StartDate,
    Date? FinishDate,
    BudgetPlannedAmounts? PlannedAmounts)
    : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys 
        => (PlannedAmounts?.Amounts.Select(a => a.CurrencyId) ?? base.ForeignKeys)
        .SelectSingle(x => ParentBudgetId != null ? x.Append(ParentBudgetId) : x);
}

public record Transaction(
    string Id,
    string Name,
    string? Description,
    DateTime Timestamp,
    TransactionType Type,
    IReadOnlyList<TransactionEntry> Entries)
    : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys
        => Entries.SelectMany(e => new[]
        {
            e.WalletId,
            e.BudgetId,
            e.CategoryId,
        }.Where(x => x != null).Concat(e.SpentAmounts.Select(a => a.CurrencyId)))!;
}

public record Conversion(
    string Id,
    string FromWalletId,
    Amount FromAmount,
    string ToWalletId,
    Amount ToAmount)
    : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys =>
    [
        FromWalletId,
        ToWalletId,
        FromAmount.CurrencyId,
        ToAmount.CurrencyId,
    ];
}

public record Transfer(
    string Id,
    string FromBudgetId,
    string ToBudgetId,
    Amount TransferredAmount,
    Date Date,
    TransferType TransferType,
    Amount? ConvertedAmount)
    : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys =>
        new List<string?>
        {
            TransferredAmount.CurrencyId,
            ConvertedAmount?.CurrencyId,
            FromBudgetId,
            ToBudgetId,
        }.Where(x => x != null)!;
}

// Sub-entities

public record TransactionEntry(
    string? BudgetId,
    string? CategoryId,
    string? WalletId,
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

public record struct Amount(string CurrencyId, decimal Value);

public record struct Date(int Year, int Month, int Day);
