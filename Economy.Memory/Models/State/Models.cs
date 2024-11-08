using Economy.Memory.Containers.Repositories;
using OneShelf.Common;

namespace Economy.Memory.Models.State;

public abstract record EntityBase(string Id)
{
    public virtual IEnumerable<string> GetForeignKeys() => Enumerable.Empty<string>();

    public abstract void Validate();

    public abstract string ToReferenceTitle(Repositories repositories);

    public abstract string ToDetails(Repositories repositories);
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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id} {Abbreviation}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {LongName} ({Abbreviation}, {CurrencySymbol})";
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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}";
}

public record Event(string Id, string Name, string? Description, string? BudgetId, Date Date) : EntityBase(Id)
{
    public override IEnumerable<string> GetForeignKeys() => BudgetId.Once().Where(x => x != null)!;

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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name} {repositories.GetReferenceTitle(BudgetId)} {Date} d:({Description})";
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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name} d:({Description})";
}

public record WalletAudit(string Id, string WalletId, DateTime CheckTimestamp, Amounts Amounts) : EntityBase(Id)
{
    public override IEnumerable<string> GetForeignKeys() => Amounts.Select(a => a.CurrencyId).Append(WalletId);

    public override void Validate()
    {
        Amounts.Validate();
        Amounts.ValidatePositive();

        if (CheckTimestamp.Year < 2020 || CheckTimestamp.Year > 2040)
        {
            throw new ArgumentException("Check timestamp must be between 2020 and 2040.");
        }
    }

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(WalletId)} {CheckTimestamp} [{Amounts.ToDetails(repositories)}]";
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
    public override IEnumerable<string> GetForeignKeys() =>
        (PlannedAmounts?.Amounts.Select(a => a.CurrencyId) ?? base.GetForeignKeys())
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

        if (PlannedAmounts != null && ParentBudgetId == null)
        {
            throw new ArgumentException("Budget planned amounts must have a parent budget.");
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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name} d:({Description}) {(ParentBudgetId == null ? null : "p:" + repositories.Budgets[ParentBudgetId].Name)} [{StartDate} - {FinishDate}] {PlannedAmounts?.ToDetails(repositories).SelectSingle(x => $"pl:[{x}]")}";
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
    public override IEnumerable<string> GetForeignKeys() =>
        Entries.SelectMany(e => new[]
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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name} d:({Description}) {Timestamp} {Type} [{string.Join(", ", Entries.Select(e => e.ToDetails(repositories)))}]";
}

public record Conversion(
    string Id,
    string FromWalletId,
    Amount FromAmount,
    string ToWalletId,
    Amount ToAmount)
    : EntityBase(Id)
{
    public override IEnumerable<string> GetForeignKeys() =>
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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromWalletId)} {FromAmount.ToDetails(repositories)} -> {repositories.GetReferenceTitle(ToWalletId)} {ToAmount.ToDetails(repositories)}";
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
    public override IEnumerable<string> GetForeignKeys() =>
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

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromBudgetId)} -> {repositories.GetReferenceTitle(ToBudgetId)} {TransferredAmount.ToDetails(repositories)} {Date} {TransferType} c=({ConvertedAmount?.ToDetails(repositories)})";
}

// Sub-entities

public record TransactionEntry(
    string? BudgetId,
    string? CategoryId,
    string? WalletId,
    string? Description,
    Amounts SpentAmounts)
{
    public void Validate()
    {
        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("Transaction entry description must be null or not empty.");
        }

        SpentAmounts.Validate();
        SpentAmounts.ValidatePositive();
    }

    public string ToDetails(Repositories repositories)
        => $"{repositories.GetReferenceTitle(BudgetId)} {repositories.GetReferenceTitle(WalletId)} {repositories.GetReferenceTitle(CategoryId)} {SpentAmounts.ToDetails(repositories)}";
}

public record BudgetPlannedAmounts(
    Amounts Amounts,
    TransactionType Type,
    bool IsCompleted)
{
    public void Validate()
    {
        Amounts.Validate();
        Amounts.ValidatePositive();
    }

    public string ToDetails(Repositories repositories)
        => $"{Amounts.ToDetails(repositories)} {Type} {(IsCompleted ? "100%" : "0%")}";
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

public class Amounts : List<Amount>
{
    public void Validate()
    {
        if (this.AnyDuplicates(a => a.CurrencyId, out _))
        {
            throw new ArgumentException("Amounts must have unique currency IDs.");
        }
    }

    public void ValidatePositive()
    {
        foreach (var amount in this)
        {
            amount.ValidatePositive();
        }
    }

    public string ToDetails(Repositories repositories)
        => string.Join(", ", this.Select(a => a.ToDetails(repositories)));
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

    public string ToDetails(Repositories repositories) => $"{Value} {repositories.Currencies[CurrencyId].Abbreviation}";
}

public record struct Date(int Year, int Month, int Day)
{
    public void Validate()
    {
        _ = new DateTime(Year, Month, Day);
    }

    public static bool operator <(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) < new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) > new DateTime(right.Year, right.Month, right.Day);

    public override string ToString()
        => $"{Year}-{Month:D2}-{Day:D2}";

    public Date AddDays(int i)
    {
        var dateTime = new DateTime(Year, Month, Day).AddDays(i);
        return new Date(dateTime.Year, dateTime.Month, dateTime.Day);
    }
}
