using System.ComponentModel;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace Economy.Temp;

internal class FinancialPlugin(ILogger<FinancialPlugin> logger, State state)
{
    [KernelFunction("create_or_update_currency")]
    [Description("Creates a new currency (empty id expected) or updates an existing one")]
    [return: Description("The created or updated currency")]
    public async Task<Currency> UpsertCurrency(Currency currency)
    {
        state.Apply(PrepareForUpsert(ref currency));
        logger.LogInformation("Creating or updating currency {Currency}", currency.ToDetails(state.Repositories));
        return currency;
    }

    [KernelFunction("create_or_update_wallet")]
    [Description("Creates a new wallet (empty id expected) or updates an existing one")]
    [return: Description("The created or updated wallet")]
    public async Task<Wallet> UpsertWallet(Wallet wallet)
    {
        state.Apply(PrepareForUpsert(ref wallet));
        logger.LogInformation("Creating or updating wallet {Wallet}", wallet.ToDetails(state.Repositories));
        return wallet;
    }

    [KernelFunction("create_or_update_event")]
    [Description("Creates a new event (empty id expected) or updates an existing one")]
    [return: Description("The created or updated event")]
    public async Task<Event> UpsertEvent(Event @event)
    {
        state.Apply(PrepareForUpsert(ref @event));
        logger.LogInformation("Creating or updating event {Event}", @event.ToDetails(state.Repositories));
        return @event;
    }

    [KernelFunction("create_or_update_category")]
    [Description("Creates a new category (empty id expected) or updates an existing one")]
    [return: Description("The created or updated category")]
    public async Task<Category> UpsertCategory(Category category)
    {
        state.Apply(PrepareForUpsert(ref category));
        logger.LogInformation("Creating or updating category {Category}", category.ToDetails(state.Repositories));
        return category;
    }

    [KernelFunction("create_or_update_wallet_audit")]
    [Description("Creates a new wallet audit (empty id expected) or updates an existing one")]
    [return: Description("The created or updated wallet audit")]
    public async Task<WalletAudit> UpsertWalletAudit(WalletAudit walletAudit)
    {
        state.Apply(PrepareForUpsert(ref walletAudit));
        logger.LogInformation("Creating or updating wallet audit {WalletAudit}", walletAudit.ToDetails(state.Repositories));
        return walletAudit;
    }

    [KernelFunction("create_or_update_budget")]
    [Description("Creates a new budget (empty id expected) or updates an existing one")]
    [return: Description("The created or updated budget")]
    public async Task<Budget> UpsertBudget(Budget budget)
    {
        state.Apply(PrepareForUpsert(ref budget));
        logger.LogInformation("Creating or updating budget {Budget}", budget.ToDetails(state.Repositories));
        return budget;
    }

    [KernelFunction("create_or_update_actual_transaction")]
    [Description("Creates a new actual_transaction (empty id expected) or updates an existing one")]
    [return: Description("The created or updated actual_transaction")]
    public async Task<ActualTransaction> UpsertActualTransaction(ActualTransaction actualTransaction)
    {
        state.Apply(PrepareForUpsert(ref actualTransaction));
        logger.LogInformation("Creating or updating actual_transaction {ActualTransaction}", actualTransaction.ToDetails(state.Repositories));
        return actualTransaction;
    }

    [KernelFunction("create_or_update_planned_transaction")]
    [Description("Creates a new planned_transaction (empty id expected) or updates an existing one")]
    [return: Description("The created or updated planned_transaction")]
    public async Task<PlannedTransaction> UpsertPlannedTransaction(PlannedTransaction plannedTransaction)
    {
        state.Apply(PrepareForUpsert(ref plannedTransaction));
        logger.LogInformation("Creating or updating planned_transaction {PlannedTransaction}", plannedTransaction.ToDetails(state.Repositories));
        return plannedTransaction;
    }

    [KernelFunction("create_or_update_conversion")]
    [Description("Creates a new conversion (empty id expected) or updates an existing one")]
    [return: Description("The created or updated conversion")]
    public async Task<Conversion> UpsertConversion(Conversion conversion)
    {
        state.Apply(PrepareForUpsert(ref conversion));
        logger.LogInformation("Creating or updating conversion {Conversion}", conversion.ToDetails(state.Repositories));
        return conversion;
    }

    [KernelFunction("create_or_update_transfer")]
    [Description("Creates a new transfer (empty id expected) or updates an existing one")]
    [return: Description("The created or updated transfer")]
    public async Task<Transfer> UpsertTransfer(Transfer transfer)
    {
        state.Apply(PrepareForUpsert(ref transfer));
        logger.LogInformation("Creating or updating transfer {Transfer}", transfer.ToDetails(state.Repositories));
        return transfer;
    }

    [KernelFunction("delete_entities")]
    [Description("Deletes entities by their ids")]
    public async Task DeleteEntities(IReadOnlyList<string> ids)
    {
        var notFound = ids.Where(x => state.Repositories.TryGetEntity(x) == null).ToList();
        if (notFound.Any())
        {
            throw new InvalidOperationException($"Entities not found: {string.Join(", ", notFound)}.");
        }

        foreach (var id in ids)
        {
            state.Apply(new Deletion(id));
        }
    }

    private EventBase PrepareForUpsert<T>(ref T entity)
        where T : EntityBase
    {
        if (entity.Id == string.Empty)
            return new Creation(entity = entity with { Id = state.Repositories.GetRepository<T>().GetNextNormalId() });

        return new Update(entity);
    }
}

public enum UpsertType
{
    Create,
    Update,
}
