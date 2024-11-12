using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;

namespace Economy.Migrations;

public class Migrator
{
    public async Task MigrateAsync(string sourceModelPath, string targetModelPath)
    {
        var sourceState = new V2.Containers.State.State();
        await sourceState.LoadFromFile(sourceModelPath);

        var targetState = new State();

        Apply(sourceState, targetState);

        await targetState.SaveToFile(targetModelPath);
    }

    private void Apply(V2.Containers.State.State sourceState, State targetState)
    {
        // Convert and apply events from sourceState to targetState
        foreach (var eventBase in sourceState.Events)
        {
            EventBase convertedEvent = eventBase switch
            {
                V2.Models.EventSourcing.Creation creation => new Creation(Convert(creation.Entity), creation.CreatedOn),
                V2.Models.EventSourcing.Update update => new Update(Convert(update.Entity), update.CreatedOn),
                V2.Models.EventSourcing.Deletion deletion => new Deletion(Convert(deletion.EntityFullId), deletion.CreatedOn),
                _ => throw new InvalidOperationException("Unknown event type")
            };

            targetState.Apply(convertedEvent);
        }
    }

    private EntityFullId Convert(V2.Models.State.EntityFullId entityFullId)
    {
        return new EntityFullId(Convert(entityFullId.Type), entityFullId.Id);
    }

    private EntityType Convert(V2.Models.State.EntityType entityType)
        => entityType switch
        {
            V2.Models.State.EntityType.Currency => EntityType.Currency,
            V2.Models.State.EntityType.Wallet => EntityType.Wallet,
            V2.Models.State.EntityType.WalletAudit => EntityType.WalletAudit,
            V2.Models.State.EntityType.Plan => EntityType.Plan,
            V2.Models.State.EntityType.Transaction => EntityType.Transaction,
            V2.Models.State.EntityType.Event => EntityType.Event,
            V2.Models.State.EntityType.Category => EntityType.Category,
            V2.Models.State.EntityType.Conversion => EntityType.Conversion,
            V2.Models.State.EntityType.Transfer => EntityType.Transfer,
            _ => throw new ArgumentOutOfRangeException(nameof(entityType), entityType, null)
        };

    private EntityBase Convert(V2.Models.State.EntityBase entity)
    {
        return entity switch
        {
            V2.Models.State.Currency currency => new Currency(currency.Id, currency.LongName, currency.Abbreviation, currency.CurrencySymbol, Convert(currency.CustomDisplayUnit)),
            V2.Models.State.Wallet wallet => new Wallet(wallet.Id, wallet.Name),
            V2.Models.State.Event @event => new Event(@event.Id, @event.Name, @event.SpecialNotes, @event.PlanId, new Date(@event.Date.Year, @event.Date.Month, @event.Date.Day)),
            V2.Models.State.Category category => new Category(category.Id, category.Name, category.SpecialNotes),
            V2.Models.State.WalletAudit walletAudit => new WalletAudit(walletAudit.Id, walletAudit.WalletId, walletAudit.CheckDateAndTime, Convert(walletAudit.Amounts)),
            V2.Models.State.Plan plan => new Plan(plan.Id, plan.Name, plan.SpecialNotes, plan.ParentPlanId, Convert(plan.StartDate), Convert(plan.FinishDate), Convert(plan.Schedule), Convert(plan.Volume)),
            V2.Models.State.Transaction transaction => new Transaction(transaction.Id, transaction.Name, transaction.SpecialNotes, transaction.DateAndTime, Convert(transaction.Type), transaction.Entries.Select(Convert).ToList()),
            V2.Models.State.Conversion conversion => new Conversion(conversion.Id, conversion.FromWalletId, Convert(conversion.FromAmount), conversion.ToWalletId, Convert(conversion.ToAmount), conversion.DateAndTime),
            V2.Models.State.Transfer transfer => new Transfer(transfer.Id, transfer.FromPlanId, transfer.ToPlanId, Convert(transfer.TransferredAmount), Convert(transfer.Date)!.Value, Convert(transfer.TransferType)),

            _ => throw new InvalidOperationException("Unknown entity type")
        };
    }

    private TransferType Convert(V2.Models.State.TransferType transferType)
    => transferType switch
    {
        V2.Models.State.TransferType.Reallocation => TransferType.Reallocation,
        V2.Models.State.TransferType.Usage => TransferType.Usage,
        _ => throw new ArgumentOutOfRangeException(nameof(transferType), transferType, null)
    };

    private TransactionEntry Convert(V2.Models.State.TransactionEntry transactionEntry)
        => new(transactionEntry.Name, transactionEntry.SpecialNotes, transactionEntry.CategoryId, transactionEntry.WalletId, transactionEntry.PlanId, Convert(transactionEntry.Amounts));

    private TransactionType Convert(V2.Models.State.TransactionType transactionType)
    => transactionType switch
    {
        V2.Models.State.TransactionType.Expense => TransactionType.Expense,
        V2.Models.State.TransactionType.Income => TransactionType.Income,
        _ => throw new ArgumentOutOfRangeException(nameof(transactionType), transactionType, null)
    };

    private Date? Convert(V2.Models.State.Date? date)
    {
        return date.HasValue ? new Date(date.Value.Year, date.Value.Month, date.Value.Day) : null;
    }

    private PlanVolume? Convert(V2.Models.State.PlanVolume? volume)
        => volume switch
        {
            null => null,
            { } x => new PlanVolume(Convert(x.Type), Convert(x.Amounts)),
        };

    private Schedule? Convert(V2.Models.State.Schedule? schedule)
        => schedule switch
        {
            null => null,
            V2.Models.State.Schedule.Daily => Schedule.Daily,
            V2.Models.State.Schedule.Weekly => Schedule.Weekly,
            V2.Models.State.Schedule.Monthly => Schedule.Monthly,
            _ => throw new ArgumentOutOfRangeException(nameof(schedule))
        };

    private Amounts Convert(V2.Models.State.Amounts amounts)
    {
        var result = new Amounts();
        foreach (var amount in amounts)
        {
            result.Add(Convert(amount));
        }

        return result;
    }

    private Amount Convert(V2.Models.State.Amount amount) => new(amount.CurrencyId, amount.Value);

    private CurrencyCustomDisplayUnit? Convert(V2.Models.State.CurrencyCustomDisplayUnit? currencyCustomDisplayUnit)
        => currencyCustomDisplayUnit switch
        {
            null => null,
            V2.Models.State.CurrencyCustomDisplayUnit.Millions => CurrencyCustomDisplayUnit.Millions,
            V2.Models.State.CurrencyCustomDisplayUnit.Thousands => CurrencyCustomDisplayUnit.Thousands,
            _ => throw new ArgumentOutOfRangeException(nameof(currencyCustomDisplayUnit))
        };
}