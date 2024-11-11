using System.ComponentModel;
using Economy.AiInterface.Scope;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace Economy.AiInterface.StateManagement;

internal class FinancialPlugin(ILogger<FinancialPlugin> logger, StateFactory stateFactory)
{
    [KernelFunction("create_or_update_currency")]
    [Description("Creates a new currency (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated currency.")]
    public async Task<Currency> UpsertCurrency(Currency currency)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref currency, out var verb));
        logger.LogInformation("{verb} currency {Currency}", verb, currency.ToDetails(state.Repositories));
        return currency;
    }

    [KernelFunction("create_or_update_wallet")]
    [Description("Creates a new wallet (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated wallet")]
    public async Task<Wallet> UpsertWallet(Wallet wallet)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref wallet, out var verb));
        logger.LogInformation("{verb} wallet {Wallet}", verb, wallet.ToDetails(state.Repositories));
        return wallet;
    }

    [KernelFunction("create_or_update_event")]
    [Description("Creates a new event (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated event")]
    public async Task<Event> UpsertEvent(Event @event)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref @event, out var verb));
        logger.LogInformation("{verb} event {Event}", verb, @event.ToDetails(state.Repositories));
        return @event;
    }

    [KernelFunction("create_or_update_category")]
    [Description("Creates a new category (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated category")]
    public async Task<Category> UpsertCategory(Category category)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref category, out var verb));
        logger.LogInformation("{verb} category {Category}", verb, category.ToDetails(state.Repositories));
        return category;
    }

    [KernelFunction("create_or_update_wallet_audit")]
    [Description("Creates a new wallet audit (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated wallet audit")]
    public async Task<WalletAudit> UpsertWalletAudit(WalletAudit walletAudit)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref walletAudit, out var verb));
        logger.LogInformation("{verb} wallet audit {WalletAudit}", verb, walletAudit.ToDetails(state.Repositories));
        return walletAudit;
    }

    [KernelFunction("create_or_update_budget")]
    [Description("Creates a new budget (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated budget")]
    public async Task<Budget> UpsertBudget(Budget budget)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref budget, out var verb));
        logger.LogInformation("{verb} budget {Budget}", verb, budget.ToDetails(state.Repositories));
        return budget;
    }

    [KernelFunction("create_or_update_actual_transaction")]
    [Description("Creates a new actual_transaction (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated actual_transaction")]
    public async Task<ActualTransaction> UpsertActualTransaction(ActualTransaction actualTransaction)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref actualTransaction, out var verb));
        logger.LogInformation("{verb} actual_transaction {ActualTransaction}", verb, actualTransaction.ToDetails(state.Repositories));
        return actualTransaction;
    }

    [KernelFunction("create_or_update_planned_transaction")]
    [Description("Creates a new planned_transaction (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated planned_transaction")]
    public async Task<PlannedTransaction> UpsertPlannedTransaction(PlannedTransaction plannedTransaction)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref plannedTransaction, out var verb));
        logger.LogInformation("{verb} planned_transaction {PlannedTransaction}", verb, plannedTransaction.ToDetails(state.Repositories));
        return plannedTransaction;
    }

    [KernelFunction("create_or_update_conversion")]
    [Description("Creates a new conversion (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated conversion")]
    public async Task<Conversion> UpsertConversion(Conversion conversion)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref conversion, out var verb));
        logger.LogInformation("{verb} conversion {Conversion}", verb, conversion.ToDetails(state.Repositories));
        return conversion;
    }

    [KernelFunction("create_or_update_transfer")]
    [Description("Creates a new transfer (empty id expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated transfer")]
    public async Task<Transfer> UpsertTransfer(Transfer transfer)
    {
        var state = await stateFactory.Get();
        state.Apply(PrepareForUpsert(state, ref transfer, out var verb));
        logger.LogInformation("{verb} transfer {Transfer}", verb, transfer.ToDetails(state.Repositories));
        return transfer;
    }

    [KernelFunction("delete_entities")]
    [Description("Deletes entities by their ids")]
    public async Task DeleteEntities(IReadOnlyList<string> ids)
    {
        var state = await stateFactory.Get();
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

    [KernelFunction("get_entities")]
    [Description("Gets all entities of the specified type")]
    public async Task<List<EntityBase>> GetEntities(EntityType entityType)
    {
        var state = await stateFactory.Get();
        // todo: may return too many entries
        return state.Repositories.GetRepository(entityType).GetAll().ToList();
    }

    [KernelFunction("get_entity_by_id")]
    [Description("Gets an entity by its id")]
    public async Task<EntityBase> GetEntityById(string id)
    {
        var state = await stateFactory.Get();
        return state.Repositories.TryGetEntity(id) ?? throw new InvalidOperationException($"Entity not found: {id}.");
    }

    private EventBase PrepareForUpsert<T>(State state, ref T entity, out string verb)
        where T : EntityBase
    {
        if (entity.Id == string.Empty)
        {
            verb = "Creating";
            return new Creation(entity = entity with { Id = state.Repositories.GetRepository<T>().GetNextNormalId() });
        }

        verb = "Updating";
        return new Update(entity);
    }
}