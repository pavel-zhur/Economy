﻿using Economy.Memory.Containers.Repositories;
using OneShelf.Common;
using System.Text.Json.Serialization;
using Economy.Memory.Tools;
using System.Reflection;
using Microsoft.VisualBasic;

namespace Economy.Memory.Models.State;

// todo: extract to files
public abstract record EntityBase(int Id)
{
    public IEnumerable<EntityFullId> GetForeignKeys() =>
        GetForeignKeysDirty().Where(x => x.HasValue).Select(x => x!.Value).Distinct();

    protected virtual IEnumerable<EntityFullId?> GetForeignKeysDirty() => Enumerable.Empty<EntityFullId?>();

    public abstract void Validate(Repositories repositories);

    public abstract string ToReferenceTitle();

    public abstract string ToDetails(Repositories repositories);

    public EntityType GetEntityType() => GetType().GetCustomAttribute<EntityTypeAttribute>()!.EntityType;

    public EntityFullId GetFullId() => new(GetEntityType(), Id);
}

// Root entities

[EntityType(EntityType.Currency)]
[method: JsonConstructor]
public record Currency(int Id, string LongName, string Abbreviation, string CurrencySymbol, CurrencyCustomDisplayUnit? CustomDisplayUnit) : EntityBase(Id)
{
    public override void Validate(Repositories repositories)
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

    public override string ToReferenceTitle()
        => $"[{Id} {Abbreviation}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {LongName} ({Abbreviation}, {CurrencySymbol}) {CustomDisplayUnit}";
}

[EntityType(EntityType.Wallet)]
[method: JsonConstructor]
public record Wallet(int Id, string Name) : EntityBase(Id)
{
    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Wallet name must be not empty.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}";
}

[EntityType(EntityType.Event)]
[method: JsonConstructor]
public record Event(int Id, string Name, string? SpecialNotes, int? PlanId, Date Date) : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => PlanId.ToEntityFullId(EntityType.Plan).Once();

    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Event name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Event special notes must be null or not empty.");
        }

        Date.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {Date}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")}";
}

[EntityType(EntityType.Category)]
[method: JsonConstructor]
public record Category(int Id, string Name, string? SpecialNotes) : EntityBase(Id)
{
    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Category name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Category special notes must be null or not empty.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")}";
}

[EntityType(EntityType.WalletAudit)]
[method: JsonConstructor]
public record WalletAudit(int Id, int WalletId, DateTime CheckDateAndTime, Amounts Amounts) : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => Amounts.GetForeignKeysDirty().Append(WalletId.ToEntityFullId(EntityType.Wallet));

    public override void Validate(Repositories repositories)
    {
        Amounts.Validate(false, true, true);

        CheckDateAndTime.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(WalletId, EntityType.Wallet)} {CheckDateAndTime} [{Amounts.ToDetails(repositories)}]";
}

[EntityType(EntityType.Plan)]
[method: JsonConstructor]
public record Plan(
    int Id,
    string Name,
    string? SpecialNotes,
    int? ParentPlanId,
    PlanSchedule? Schedule)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => ParentPlanId.ToEntityFullId(EntityType.Plan).Once();

    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Plan name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Plan special notes must be null or not empty.");
        }

        Schedule?.Validate();

        if (Schedule != null &&
            repositories.Plans.GetParents(this).Any(x => x.Schedule != null))
        {
            throw new ArgumentException("Plans with schedules may not be nested.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")} p:{repositories.GetReferenceTitle(ParentPlanId, EntityType.Plan)} {Schedule?.ToDetails()}";
}

[EntityType(EntityType.Transaction)]
[method: JsonConstructor]
public record Transaction(
    int Id,
    string Name,
    string? SpecialNotes,
    int PlanId,
    TransactionType Type,
    TransactionPlannedAmount? Planned,
    TransactionActualAmount? Actual)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        (Planned?.GetForeignKeysDirty() ?? Enumerable.Empty<EntityFullId?>())
        .Concat(Actual?.GetForeignKeysDirty() ?? Enumerable.Empty<EntityFullId?>())
        .Append(PlanId.ToEntityFullId(EntityType.Plan));

    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Transaction name must be not empty.");
        }

        if (Planned == null && Actual == null)
        {
            throw new ArgumentException("Transaction must have either planned or actual amounts.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Transaction special notes must be null or not empty.");
        }

        Planned?.Validate();
        Actual?.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public string ToDetailsNoAmountsOrType(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)}";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")} {repositories.GetReferenceTitle(PlanId, EntityType.Plan)} {Type} {Planned} {Actual}";
}

[EntityType(EntityType.Conversion)]
[method: JsonConstructor]
public record Conversion(
    int Id,
    int FromWalletId,
    Amount FromAmount,
    int ToWalletId,
    Amount ToAmount,
    DateTime DateAndTime)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
    [
        FromWalletId.ToEntityFullId(EntityType.Wallet),
        ToWalletId.ToEntityFullId(EntityType.Wallet),
        FromAmount.CurrencyId.ToEntityFullId(EntityType.Currency),
        ToAmount.CurrencyId.ToEntityFullId(EntityType.Currency), 
    ];

    public override void Validate(Repositories repositories)
    {
        FromAmount.Validate(false, false, true);
        ToAmount.Validate(false, false, true);

        DateAndTime.Validate();

        if (FromAmount.CurrencyId == ToAmount.CurrencyId)
        {
            throw new ArgumentException("Conversion currencies must be different.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromWalletId, EntityType.Wallet)} {FromAmount.ToDetails(repositories)} -> {repositories.GetReferenceTitle(ToWalletId, EntityType.Wallet)} {ToAmount.ToDetails(repositories)}";
}

[EntityType(EntityType.Transfer)]
[method: JsonConstructor]
public record Transfer(
    int Id,
    int FromPlanId,
    int ToPlanId,
    Amount Amount,
    Date Date,
    TransferType Type)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() =>
        new List<EntityFullId?>
        {
            Amount.CurrencyId.ToEntityFullId(EntityType.Currency),
            FromPlanId.ToEntityFullId(EntityType.Plan),
            ToPlanId.ToEntityFullId(EntityType.Plan),
        };

    public override void Validate(Repositories repositories)
    {
        Amount.Validate(false, false, true);

        Date.Validate();

        if (FromPlanId == ToPlanId)
        {
            throw new ArgumentException("Transfer plans must be different.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {repositories.GetReferenceTitle(FromPlanId, EntityType.Plan)} -> {repositories.GetReferenceTitle(ToPlanId, EntityType.Plan)} {Amount.ToDetails(repositories)} {Date} {Type}";
}

// Sub-entities

[method: JsonConstructor]
public record TransactionPlannedAmount(
    Date Date,
    Amounts Amounts)
{
    internal IEnumerable<EntityFullId?> GetForeignKeysDirty() => Amounts.GetForeignKeysDirty();

    public void Validate()
    {
        Date.Validate();
        Amounts.Validate(false, false, true);
    }

    public string ToDetails(Repositories repositories)
        => $"[A: {Date} {Amounts.ToDetails(repositories)}]";
}

[method: JsonConstructor]
public record TransactionActualAmount(
    DateTime DateAndTime,
    Amounts Amounts)
{
    internal IEnumerable<EntityFullId?> GetForeignKeysDirty() => Amounts.GetForeignKeysDirty();

    public void Validate()
    {
        DateAndTime.Validate();

        Amounts.Validate(false, false, true);
    }

    public string ToDetails(Repositories repositories)
        => $"[A: {DateAndTime} {Amounts.ToDetails(repositories)}]";
}

// Value objects

public enum TransferType
{
    Reallocation,
    Usage,
}

public record PlanSchedule(Date StartDate, Date FinishDate, Schedule Schedule)
{
    public void Validate()
    {
        StartDate.Validate();
        FinishDate.Validate();

        if (StartDate > FinishDate)
        {
            throw new ArgumentException("Plan schedule start date must be before finish date.");
        }
    }

    public string ToDetails() => $"[{Schedule} {{StartDate}} - {{FinishDate}}]";
}

public enum Schedule
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

public record PlanVolume(TransactionType Type, Amounts Amounts)
{
    public void Validate()
    {
        Amounts.Validate(false, false, true);
    }

    public string ToDetails(Repositories repositories)
        => $"{Type} {Amounts.ToDetails(repositories)}";
}

[Obsolete("Refactor")] // todo: think
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

    [Obsolete("Refactor")] // todo: think
    public void Add(Amounts other, bool subtract = false)
    {
        var result = other.Select(a => a.CurrencyId)
            .Union(this.Select(a => a.CurrencyId))
            .Select(c =>
            {
                var thisValue = this.FirstOrDefault(a => a.CurrencyId == c).Value;
                var otherValue = other.FirstOrDefault(a => a.CurrencyId == c).Value;
                var result = subtract ? thisValue - otherValue : thisValue + otherValue;
                return new Amount(c, result);
            })
            .Where(x => x.Value != 0)
            .ToList();

        Clear();
        AddRange(result);
    }

    internal IEnumerable<EntityFullId?> GetForeignKeysDirty() => this.Select(x => new EntityFullId(EntityType.Currency, x.CurrencyId).OnceAsNullable());
}

[method: JsonConstructor]
public record struct Amount(int CurrencyId, decimal Value)
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

    public string ToDetails(Repositories repositories)
    {
        var currency = repositories.Currencies[CurrencyId];
        var value = Value;
        string? prefix = null;
        switch (currency.CustomDisplayUnit)
        {
            case CurrencyCustomDisplayUnit.Thousands:
                value /= 1000;
                prefix = "k";
                break;
            case CurrencyCustomDisplayUnit.Millions:
                value /= 1_000_000;
                prefix = "m";
                break;
        }

        return $"{value} {prefix}{currency.Abbreviation}";
    }
}

[method: JsonConstructor]
public record struct Date(int Year, int Month, int Day) : IComparable<Date>
{
    public void Validate()
    {
        this.ToDateTime().Validate();
    }

    public static bool operator <(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) < new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) > new DateTime(right.Year, right.Month, right.Day);
    public static bool operator <=(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) <= new DateTime(right.Year, right.Month, right.Day);
    public static bool operator >=(Date left, Date right) => new DateTime(left.Year, left.Month, left.Day) >= new DateTime(right.Year, right.Month, right.Day);

    public override string ToString()
        => $"{Day:D2}.{Month:D2}.{Year}";

    public Date AddDays(int i)
    {
        var dateTime = new DateTime(Year, Month, Day).AddDays(i);
        return new Date(dateTime.Year, dateTime.Month, dateTime.Day);
    }

    public int CompareTo(Date other)
    {
        var yearComparison = Year.CompareTo(other.Year);
        if (yearComparison != 0) return yearComparison;
        var monthComparison = Month.CompareTo(other.Month);
        if (monthComparison != 0) return monthComparison;
        return Day.CompareTo(other.Day);
    }
}

public enum EntityType
{
    Currency,
    Wallet,
    WalletAudit,
    Plan,
    Transaction,
    Event,
    Category,
    Conversion,
    Transfer,
}

public enum CurrencyCustomDisplayUnit
{
    Thousands,
    Millions,
}

public record struct EntityFullId(EntityType Type, int Id);