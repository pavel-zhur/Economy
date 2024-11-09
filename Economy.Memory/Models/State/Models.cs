﻿using Economy.Memory.Containers.Repositories;
using OneShelf.Common;
using System.Text.Json.Serialization;

namespace Economy.Memory.Models.State;

public abstract record EntityBase(string Id)
{
    public IEnumerable<string> GetForeignKeys() => GetForeignKeysDirty().Where(x => x != null).Distinct()!;

    protected virtual IEnumerable<string?> GetForeignKeysDirty() => Enumerable.Empty<string>();

    public abstract void Validate();

    public abstract string ToReferenceTitle(Repositories repositories);

    public abstract string ToDetails(Repositories repositories);
}

// Root entities

[EntityType(EntityType.Currency)]
[method: JsonConstructor]
public record Currency(string Id, string LongName, string Abbreviation, string CurrencySymbol) : EntityBase(Id)
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

[EntityType(EntityType.Wallet)]
[method: JsonConstructor]
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

[EntityType(EntityType.Event)]
[method: JsonConstructor]
public record Event(string Id, string Name, string? Description, string? BudgetId, Date Date) : EntityBase(Id)
{
    protected override IEnumerable<string?> GetForeignKeysDirty() => BudgetId.Once();

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

[EntityType(EntityType.Category)]
[method: JsonConstructor]
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

[EntityType(EntityType.WalletAudit)]
[method: JsonConstructor]
public record WalletAudit(string Id, string WalletId, DateTime CheckTimestamp, Amounts Amounts) : EntityBase(Id)
{
    protected override IEnumerable<string?> GetForeignKeysDirty() => Amounts.Select(a => a.CurrencyId).Append(WalletId);

    public override void Validate()
    {
        Amounts.Validate(false, true, true);

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

[EntityType(EntityType.Budget)]
[method: JsonConstructor]
public record Budget(
    string Id,
    string Name,
    string? Description,
    string? ParentBudgetId,
    Date? StartDate,
    Date? FinishDate)
    : EntityBase(Id)
{
    protected override IEnumerable<string?> GetForeignKeysDirty() => ParentBudgetId.Once();

    public override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Budget name must be not empty.");
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
    }

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name} d:({Description}) p:{repositories.GetReferenceTitle(ParentBudgetId)} [{StartDate} - {FinishDate}]";
}

[EntityType(EntityType.PlannedTransaction)]
[method: JsonConstructor]
public record PlannedTransaction(
    string Id,
    string? Description,
    string BudgetId,
    Amounts Amounts,
    TransactionType Type,
    PlannedTransactionSchedule? Schedule,
    Date? Date,
    bool IsCompleted)
    : EntityBase(Id)
{
    public override void Validate()
    {
        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("Planned transaction description must be null or not empty.");
        }

        Amounts.Validate(false, false, true);
        Date?.Validate();
    }

    public override string ToReferenceTitle(Repositories repositories)
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(BudgetId)} {Date} {Amounts.ToDetails(repositories)} {Type} {(IsCompleted ? "100%" : "0%")} d:({Description}) {Schedule}";

    protected override IEnumerable<string?> GetForeignKeysDirty()
        => Amounts.Select(a => a.CurrencyId).Append(BudgetId);
}

[EntityType(EntityType.ActualTransaction)]
[method: JsonConstructor]
public record ActualTransaction(
    string Id,
    string Name,
    string? Description,
    DateTime Timestamp,
    TransactionType Type,
    IReadOnlyList<ActualTransactionEntry> Entries)
    : EntityBase(Id)
{
    protected override IEnumerable<string?> GetForeignKeysDirty() =>
        Entries.SelectMany(e => new[]
        {
            e.WalletId,
            e.BudgetId,
            e.CategoryId,
            e.PlannedTransactionId,
        }.Concat(e.Amounts.Select(a => a.CurrencyId)))!;

    public override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Actual transaction name must be not empty.");
        }

        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("Actual transaction description must be null or not empty.");
        }

        if (Timestamp.Year < 2020 || Timestamp.Year > 2040)
        {
            throw new ArgumentException("Actual transaction timestamp must be between 2020 and 2040.");
        }

        if (Entries.AnyDuplicates(e => (e.WalletId, e.CategoryId), out _))
        {
            throw new ArgumentException("Actual transaction entries must have unique wallet IDs.");
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

[EntityType(EntityType.Conversion)]
[method: JsonConstructor]
public record Conversion(
    string Id,
    string FromWalletId,
    Amount FromAmount,
    string ToWalletId,
    Amount ToAmount)
    : EntityBase(Id)
{
    protected override IEnumerable<string?> GetForeignKeysDirty() =>
    [
        FromWalletId,
        ToWalletId,
        FromAmount.CurrencyId,
        ToAmount.CurrencyId,
    ];

    public override void Validate()
    {
        FromAmount.Validate(false, false, true);
        ToAmount.Validate(false, false, true);

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

[EntityType(EntityType.Transfer)]
[method: JsonConstructor]
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
    protected override IEnumerable<string?> GetForeignKeysDirty() =>
        new List<string?>
        {
            TransferredAmount.CurrencyId,
            ConvertedAmount?.CurrencyId,
            FromBudgetId,
            ToBudgetId,
        };

    public override void Validate()
    {
        TransferredAmount.Validate(false, false, true);
        ConvertedAmount?.Validate(false, false, true);

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

[method: JsonConstructor]
public record ActualTransactionEntry(
    string? Name,
    string? Description,
    string? PlannedTransactionId,
    string? CategoryId,
    string? WalletId,
    string? BudgetId,
    Amounts Amounts)
{
    public void Validate()
    {
        if (Name != null && string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("ActualTransaction entry name must be null or not empty.");
        }

        if (Description != null && string.IsNullOrWhiteSpace(Description))
        {
            throw new ArgumentException("ActualTransaction entry description must be null or not empty.");
        }

        Amounts.Validate(false, false, true);

        if (BudgetId != null && PlannedTransactionId != null)
        {
            throw new ArgumentException("ActualTransaction entry must have either budget or planned transaction ID, not both.");
        }
    }

    public string ToDetails(Repositories repositories)
        => $"{repositories.GetReferenceTitle(BudgetId)} {repositories.GetReferenceTitle(PlannedTransactionId)} {repositories.GetReferenceTitle(WalletId)} {repositories.GetReferenceTitle(CategoryId)} {Amounts.ToDetails(repositories)}";
}

// Value objects

public enum TransferType
{
    Reallocation,
    Usage,
}

public enum PlannedTransactionSchedule
{
    Daily,
    Weekly,
    Monthly,
}

public enum TransactionType
{
    Income,
    Expense,
}

public class Amounts : List<Amount>
{
    public void Validate(bool allowNegative, bool allowZero, bool allowPositive)
    {
        if (this.AnyDuplicates(a => a.CurrencyId, out _))
        {
            throw new ArgumentException("Amounts must have unique currency IDs.");
        }

        foreach (var amount in this)
        {
            amount.Validate(allowNegative, allowZero, allowPositive);
        }
    }

    public string ToDetails(Repositories repositories)
        => string.Join(", ", this.Select(a => a.ToDetails(repositories)));
}

[method: JsonConstructor]
public record struct Amount(string CurrencyId, decimal Value)
{
    public void Validate(bool allowNegative, bool allowZero, bool allowPositive)
    {
        if (Value < 0 && !allowNegative)
        {
            throw new ArgumentException("Amount value must be non-negative.");
        }

        if (Value == 0 && !allowZero)
        {
            throw new ArgumentException("Amount value must be non-zero.");
        }

        if (Value > 0 && !allowPositive)
        {
            throw new ArgumentException("Amount value must be non-positive.");
        }
    }

    public string ToDetails(Repositories repositories) => $"{Value} {repositories.Currencies[CurrencyId].Abbreviation}";
}

[method: JsonConstructor]
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

public enum EntityType
{
    Currency,
    Wallet,
    WalletAudit,
    Budget,
    PlannedTransaction,
    ActualTransaction,
    Event,
    Category,
    Conversion,
    Transfer,
}