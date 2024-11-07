using OneShelf.Common;

namespace Economy.Memory.Models.State;

public abstract record EntityBase(string Id)
{
    public virtual IEnumerable<string> ForeignKeys => Enumerable.Empty<string>();

    public abstract void Validate();
}

// Root entities

public record Currency(string Id, string LongName, string Abbreviation, char CurrencySymbol) : EntityBase(Id)
{
    public override void Validate()
    {
        if (Abbreviation.Length != 3)
        {
            throw new ArgumentException("Currency abbreviation must be 3 characters long.");
        }

        if (CurrencySymbol == default)
        {
            throw new ArgumentException("Currency symbol must be provided.");
        }

        if (string.IsNullOrWhiteSpace(LongName))
        {
            throw new ArgumentException("Currency long name must be not empty.");
        }
    }
}

public record Wallet(string Id, string Name) : EntityBase(Id)
{
    public override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Wallet name must be not empty.");
        }
    }
}

public record Event(string Id, string Name, string? Description, string? BudgetId, Date Date) : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys => BudgetId.Once().Where(x => x != null)!;

    public override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Event name must be not empty.");
        }

        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("Event description must be null or not empty.");
        }

        Date.Validate();
    }
}

public record Category(string Id, string Name, string? Description) : EntityBase(Id)
{
    public override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Category name must be not empty.");
        }

        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("Category description must be null or not empty.");
        }
    }
}

public record WalletAudit(string Id, string WalletId, DateTime CheckTimestamp, IReadOnlyList<Amount> Amounts) : EntityBase(Id)
{
    public override IEnumerable<string> ForeignKeys => Amounts.Select(a => a.CurrencyId).Append(WalletId);

    public override void Validate()
    {
        if (Amounts.AnyDuplicates(x => x.CurrencyId, out _))
        {
            throw new ArgumentException("Wallet audit amounts must have unique currency IDs.");
        }

        foreach (var amount in Amounts)
        {
            amount.ValidatePositive();
        }

        if (CheckTimestamp.Year < 2020 || CheckTimestamp.Year > 2040)
        {
            throw new ArgumentException("Check timestamp must be between 2020 and 2040.");
        }
    }
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

    public override void Validate()
    {
        if (Name != null && string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Budget name must be null or not empty.");
        }

        if (Name == null && PlannedAmounts == null)
        {
            throw new ArgumentException("Budget must have either name or planned amounts.");
        }

        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("Budget description must be null or not empty.");
        }

        StartDate?.Validate();
        FinishDate?.Validate();

        if (StartDate > FinishDate)
        {
            throw new ArgumentException("Budget start date must be before finish date.");
        }

        PlannedAmounts?.Validate();
    }
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

    public override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Transaction name must be not empty.");
        }

        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("Transaction description must be null or not empty.");
        }

        if (Timestamp.Year < 2020 || Timestamp.Year > 2040)
        {
            throw new ArgumentException("Transaction timestamp must be between 2020 and 2040.");
        }

        if (Entries.AnyDuplicates(e => (e.WalletId, e.CategoryId), out _))
        {
            throw new ArgumentException("Transaction entries must have unique wallet IDs.");
        }

        foreach (var entry in Entries)
        {
            entry.Validate();
        }
    }
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

    public override void Validate()
    {
        FromAmount.ValidatePositive();
        ToAmount.ValidatePositive();

        if (FromAmount.CurrencyId == ToAmount.CurrencyId)
        {
            throw new ArgumentException("Conversion currencies must be different.");
        }
    }
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

    public override void Validate()
    {
        TransferredAmount.ValidatePositive();
        ConvertedAmount?.ValidatePositive();

        if (TransferredAmount.CurrencyId == ConvertedAmount?.CurrencyId)
        {
            throw new ArgumentException("Transferred and converted (if present) amounts must have different currency IDs.");
        }

        if (Date.Year < 2020 || Date.Year > 2040)
        {
            throw new ArgumentException("Transfer date must be between 2020 and 2040.");
        }

        if (FromBudgetId == ToBudgetId && ConvertedAmount == null)
        {
            throw new ArgumentException("Transfer between the same budget must have a converted amount.");
        }
    }
}

// Sub-entities

public record TransactionEntry(
    string? BudgetId,
    string? CategoryId,
    string? WalletId,
    string? Description,
    IReadOnlyList<Amount> SpentAmounts)
{
    public void Validate()
    {
        if (SpentAmounts.AnyDuplicates(a => a.CurrencyId, out _))
        {
            throw new ArgumentException("Transaction entry amounts must have unique currency IDs.");
        }

        foreach (var amount in SpentAmounts)
        {
            amount.ValidatePositive();
        }
    }
}

public record BudgetPlannedAmounts(
    IReadOnlyList<Amount> Amounts,
    TransactionType Type,
    bool IsCompleted)
{
    public void Validate()
    {
        if (Amounts.AnyDuplicates(x => x.CurrencyId, out _))
        {
            throw new ArgumentException("Budget planned amounts must have unique currency IDs.");
        }

        foreach (var amount in Amounts)
        {
            amount.ValidatePositive();
        }
    }
}

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

public record struct Amount(string CurrencyId, decimal Value)
{
    public void ValidatePositive()
    {
        if (Value <= 0)
        {
            throw new ArgumentException("Amount value must be positive.");
        }
    }
}

public record struct Date(int Year, int Month, int Day)
{
    public void Validate()
    {
        _ = new DateTime(Year, Month, Day);
    }

    public static bool operator <(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) < new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) > new DateTime(right.Year, right.Month, right.Day);
}
