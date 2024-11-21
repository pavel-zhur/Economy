using System.ComponentModel;
using Economy.Engine;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace Economy.Implementation;

public class FinancialPlugin(ILogger<FinancialPlugin> logger, StateFactory<State> stateFactory)
{
    [KernelFunction("create_or_update_currency")]
    [Description("Creates a new currency (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated currency.")]
    public async Task<Currency> UpsertCurrency(Currency currency)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref currency, out var verb));
        logger.LogInformation("{verb} currency {Currency}", verb, currency.ToDetails(state.Repositories));
        return currency;
    }

    [KernelFunction("create_or_update_wallet")]
    [Description("Creates a new wallet (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated wallet")]
    public async Task<Wallet> UpsertWallet(Wallet wallet)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref wallet, out var verb));
        logger.LogInformation("{verb} wallet {Wallet}", verb, wallet.ToDetails(state.Repositories));
        return wallet;
    }

    [KernelFunction("create_or_update_event")]
    [Description("Creates a new event (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated event")]
    public async Task<Event> UpsertEvent(Event @event)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref @event, out var verb));
        logger.LogInformation("{verb} event {Event}", verb, @event.ToDetails(state.Repositories));
        return @event;
    }

    [KernelFunction("create_or_update_category")]
    [Description("Creates a new category (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated category")]
    public async Task<Category> UpsertCategory(Category category)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref category, out var verb));
        logger.LogInformation("{verb} category {Category}", verb, category.ToDetails(state.Repositories));
        return category;
    }

    [KernelFunction("create_or_update_wallet_audit")]
    [Description("Creates a new wallet audit (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated wallet audit")]
    public async Task<WalletAudit> UpsertWalletAudit(WalletAudit walletAudit)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref walletAudit, out var verb));
        logger.LogInformation("{verb} wallet audit {WalletAudit}", verb, walletAudit.ToDetails(state.Repositories));
        return walletAudit;
    }

    [KernelFunction("create_or_update_plan")]
    [Description("Creates a new plan (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated plan")]
    public async Task<Plan> UpsertPlan(Plan plan)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref plan, out var verb));
        logger.LogInformation("{verb} plan {Plan}", verb, plan.ToDetails(state.Repositories));
        return plan;
    }

    [KernelFunction("create_or_update_transaction")]
    [Description("Creates a new transaction (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated transaction")]
    public async Task<Transaction> UpsertTransaction(Transaction transaction)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref transaction, out var verb));
        logger.LogInformation("{verb} transaction {Transaction}", verb, transaction.ToDetails(state.Repositories));
        return transaction;
    }

    [KernelFunction("create_or_update_conversion")]
    [Description("Creates a new conversion (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated conversion")]
    public async Task<Conversion> UpsertConversion(Conversion conversion)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref conversion, out var verb));
        logger.LogInformation("{verb} conversion {Conversion}", verb, conversion.ToDetails(state.Repositories));
        return conversion;
    }

    [KernelFunction("create_or_update_transfer")]
    [Description("Creates a new transfer (-1 id value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated transfer")]
    public async Task<Transfer> UpsertTransfer(Transfer transfer)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref transfer, out var verb));
        logger.LogInformation("{verb} transfer {Transfer}", verb, transfer.ToDetails(state.Repositories));
        return transfer;
    }

    [KernelFunction("delete_entity")]
    [Description("Deletes entity of a given type by id")]
    public async Task DeleteEntities(EntityType entityType, int id)
    {
        var state = await stateFactory.GetState();
        if (state.Repositories.GetRepository(entityType).TryGetById(id) == null)
        {
            throw new InvalidOperationException($"{entityType}with id {id} is not found.");
        }

        state.Apply(new Deletion(new EntityFullId(entityType, id), DateTime.UtcNow));
    }

    [KernelFunction("get_entities")]
    [Description("Gets all entities of the specified type")]
    public async Task<List<EntityBase>> GetEntities(EntityType entityType)
    {
        var state = await stateFactory.GetState();
        // todo: may return too many entries
        return state.Repositories.GetRepository(entityType).GetAll().ToList();
    }

    [KernelFunction("get_entity_by_id")]
    [Description("Gets an entity by its id")]
    public async Task<EntityBase> GetEntityById(EntityType entityType, int id)
    {
        var state = await stateFactory.GetState();
        return state.Repositories.GetRepository(entityType).TryGetById(id) ?? throw new InvalidOperationException($"Entity not found: {id}.");
    }

    private EventBase PrepareForUpsert<T>(State state, ref T entity, out string verb)
        where T : EntityBase
    {
        switch (entity.Id)
        {
            case -1:
                verb = "Creating";
                return new Creation(entity = entity with { Id = state.Repositories.GetRepository<T>().GetNextNormalId() }, DateTime.UtcNow);
            case 0 or < -1:
                throw new("To update an entity, pass specify its id. To create an entity, pass id -1.");
            default:
                verb = "Updating";
                return new Update(entity, DateTime.UtcNow);
        }
    }
}