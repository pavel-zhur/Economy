using System.ComponentModel;
using Economy.Engine.Services;
using Economy.Implementation.Factories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Models.State.Sub;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace Economy.Implementation;

internal class FinancialPlugin(ILogger<FinancialPlugin> logger, IStateFactory<States> stateFactory)
{
    [KernelFunction("create_or_update_currency")]
    [Description("Creates a new currency (currency.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated currency.")]
    public async Task<Currency> UpsertCurrency(Currency currency)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref currency, out var verb));
        logger.LogInformation("{verb} currency {Currency}", verb, currency.ToDetails().ToString(state.Current.state.Repositories));
        return currency;
    }

    [KernelFunction("create_or_update_wallet")]
    [Description("Creates a new wallet (wallet.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated wallet")]
    public async Task<Wallet> UpsertWallet(Wallet wallet)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref wallet, out var verb));
        logger.LogInformation("{verb} wallet {Wallet}", verb, wallet.ToDetails().ToString(state.Current.state.Repositories));
        return wallet;
    }

    [KernelFunction("create_or_update_event")]
    [Description("Creates a new event (event.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated event")]
    public async Task<Event> UpsertEvent(Event @event)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref @event, out var verb));
        logger.LogInformation("{verb} event {Event}", verb, @event.ToDetails().ToString(state.Current.state.Repositories));
        return @event;
    }

    [KernelFunction("create_or_update_category")]
    [Description("Creates a new category (category.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated category")]
    public async Task<Category> UpsertCategory(Category category)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref category, out var verb));
        logger.LogInformation("{verb} category {Category}", verb, category.ToDetails().ToString(state.Current.state.Repositories));
        return category;
    }

    [KernelFunction("create_or_update_wallet_audit")]
    [Description("Creates a new wallet audit (walletAudit.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated wallet audit")]
    public async Task<WalletAudit> UpsertWalletAudit(WalletAudit walletAudit)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref walletAudit, out var verb));
        logger.LogInformation("{verb} wallet audit {WalletAudit}", verb, walletAudit.ToDetails().ToString(state.Current.state.Repositories));
        return walletAudit;
    }

    private async Task<Plan> UpsertPlan(Plan plan)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref plan, out var verb));
        logger.LogInformation("{verb} plan {Plan}", verb, plan.ToDetails().ToString(state.Current.state.Repositories));
        return plan;
    }

    [KernelFunction("create_plan")]
    [Description("Creates a new plan without an expected financial activity. " +
        "A plan is an expected or planned expense or income, or a group of those, or a recurring set of those, or a budget, fund, etc. " +
        "For incomes or expenses that have actually happened, use the transaction entity. " +
        "A plan may have an expected financial activity (expense or income), in that case, use the corresponding overloads to specify that activity.")]
    [return: Description("The created plan")]
    public async Task<Plan> CreatePlan(string name, string? specialNotes,
        [Description("Parent plan id, if any. Otherwise, -1")] int? parentPlanId)
    {
        return await UpsertPlan(new(
            -1,
            name,
            specialNotes,
            parentPlanId switch
            {
                -1 => null,
                _ => parentPlanId,
            },
            null));
    }
    
    [KernelFunction("create_plan_with_expected_activity")]
    [Description("Creates a new plan with an expected one-time financial activity.")]
    [return: Description("The created plan")]
    public async Task<Plan> CreatePlanWithExpectedFinancialActivity(
        string name, 
        string? specialNotes,
        [Description("Parent plan id, if any. Otherwise, -1")]
        int? parentPlanId,
        PlanExpectedFinancialActivityType expectedActivityType,
        Amounts expectedActivityAmounts,
        Date? expectedActivityDate)
    {
        return await UpsertPlan(new(
            -1, 
            name, 
            specialNotes,
            parentPlanId switch
            {
                -1 => null,
                _ => parentPlanId,
            },
            new(expectedActivityType, expectedActivityAmounts, null, expectedActivityDate)));
    }

    [KernelFunction("create_plan_with_recurring_expected_activity")]
    [Description("Creates a new plan with an expected recurring financial activity.")]
    [return: Description("The created plan")]
    public async Task<Plan> CreatePlanWithExpectedFinancialActivity(string name,
        string? specialNotes,
        [Description("Parent plan id, if any. Otherwise, -1")]
        int? parentPlanId,
        PlanExpectedFinancialActivityType expectedActivityType,
        Amounts expectedActivityAmounts, 
        Date expectedActivityPeriodStartDate,
        Date expectedActivityPeriodEndDate,
        RecurringInterval expectedActivityPeriodRecurringInterval,
        RecurringAmountsBalancingBehavior expectedActivityRecurringAmountsBalancingBehavior)
    {
        return await UpsertPlan(new(
            -1,
            name,
            specialNotes,
            parentPlanId switch
            {
                -1 => null,
                _ => parentPlanId,
            },
            new(expectedActivityType, expectedActivityAmounts, new(new(expectedActivityPeriodStartDate, expectedActivityPeriodStartDate), expectedActivityPeriodRecurringInterval, expectedActivityRecurringAmountsBalancingBehavior), null)));
    }

    [KernelFunction("update_plan")]
    [Description("Updates main properties of an existing plan.")]
    [return: Description("The updated plan")]
    public async Task<Plan> UpdatePlan(int planId, string name, string? specialNotes,
        [Description("Parent plan id, if any. Otherwise, -1")] int? parentPlanId)
    {
        var plan = (await stateFactory.GetState()).Current.state.Repositories.Plans[planId];

        return await UpsertPlan(new(
            planId,
            name,
            string.IsNullOrWhiteSpace(specialNotes) ? null : specialNotes,
            parentPlanId switch
            {
                -1 => null,
                _ => parentPlanId,
            },
            plan.ExpectedFinancialActivity));
    }

    [KernelFunction("clear_plan_expected_activity")]
    [Description("Clears expected financial activity of a plan.")]
    [return: Description("The updated plan")]
    public async Task<Plan> ClearPlanExpectedFinancialActivity(int planId)
    {
        var plan = (await stateFactory.GetState()).Current.state.Repositories.Plans[planId];

        return await UpsertPlan(plan with
        {
            ExpectedFinancialActivity = null
        });
    }

    [KernelFunction("set_plan_expected_activity")]
    [Description("Sets a one-time expected financial activity of a plan.")]
    public async Task<Plan> SetPlanExpectedFinancialActivity(int planId, PlanExpectedFinancialActivityType expectedActivityType, Amounts expectedActivityAmounts, Date? expectedActivityDate)
    {
        var plan = (await stateFactory.GetState()).Current.state.Repositories.Plans[planId];
        
        return await UpsertPlan(plan with
        {
            ExpectedFinancialActivity = new(expectedActivityType, expectedActivityAmounts, null, expectedActivityDate)
        });
    }

    [KernelFunction("set_plan_recurring_expected_activity")]
    [Description("Sets a recurring expected financial activity of a plan.")]
    [return: Description("The updated plan")]
    public async Task<Plan> SetPlanRecurringExpectedFinancialActivity(int planId, PlanExpectedFinancialActivityType expectedActivityType, Amounts expectedActivityAmounts, Date expectedActivityPeriodStartDate, Date expectedActivityPeriodEndDate, RecurringInterval expectedActivityPeriodRecurringInterval, RecurringAmountsBalancingBehavior expectedActivityRecurringAmountsBalancingBehavior)
    {
        var plan = await GetEntityById(EntityType.Plan, planId) as Plan;
        
        return await UpsertPlan(plan with
        {
            ExpectedFinancialActivity = new(expectedActivityType, expectedActivityAmounts, new(new(expectedActivityPeriodStartDate, expectedActivityPeriodEndDate), expectedActivityPeriodRecurringInterval, expectedActivityRecurringAmountsBalancingBehavior), null)
        });
    }

    [KernelFunction("create_or_update_transaction")]
    [Description("Creates a new transaction (transaction.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties). " +
                 "A transaction is an expense or income that has actually happened, not a planned, not a desired, not a future - for those, use the plan entity and set their expected financial activity, including amount and a planned date or planned recurring dates.")]
    [return: Description("The created (with id assigned) or updated transaction")]
    public async Task<Transaction> UpsertTransaction(Transaction transaction)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref transaction, out var verb));
        logger.LogInformation("{verb} transaction {Transaction}", verb, transaction.ToDetails().ToString(state.Current.state.Repositories));
        return transaction;
    }

    [KernelFunction("create_or_update_conversion")]
    [Description("Creates a new conversion (conversion.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated conversion")]
    public async Task<Conversion> UpsertConversion(Conversion conversion)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref conversion, out var verb));
        logger.LogInformation("{verb} conversion {Conversion}", verb, conversion.ToDetails().ToString(state.Current.state.Repositories));
        return conversion;
    }

    [KernelFunction("create_or_update_transfer")]
    [Description("Creates a new transfer (transfer.id: -1 value expected) or updates an existing one (entire record will be overridden, all properties)")]
    [return: Description("The created (with id assigned) or updated transfer")]
    public async Task<Transfer> UpsertTransfer(Transfer transfer)
    {
        var state = await stateFactory.GetState();
        state.Apply(PrepareForUpsert(state, ref transfer, out var verb));
        logger.LogInformation("{verb} transfer {Transfer}", verb, transfer.ToDetails().ToString(state.Current.state.Repositories));
        return transfer;
    }

    [KernelFunction("delete_entity")]
    [Description("Deletes entity of a given type by id")]
    public async Task DeleteEntities(EntityType entityType, int id)
    {
        var state = await stateFactory.GetState();
        if (state.Current.state.Repositories.GetRepository(entityType).TryGetById(id) == null)
        {
            throw new InvalidOperationException($"{entityType}with id {id} is not found.");
        }

        var (parentId, revision) = state.Current.state.GetNextEventParentIdAndRevision();
        state.Apply(new Deletion(new(entityType, id), DateTime.UtcNow, Guid.NewGuid(), parentId, revision));
    }

    [KernelFunction("get_entities")]
    [Description("Gets all entities of the specified type")]
    public async Task<List<EntityBase>> GetEntities(EntityType entityType)
    {
        var state = await stateFactory.GetState();
        // todo: may return too many entries
        return state.Current.state.Repositories.GetRepository(entityType).GetAll().ToList();
    }

    [KernelFunction("get_entity_by_id")]
    [Description("Gets an entity by its id")]
    public async Task<EntityBase> GetEntityById(EntityType entityType, int id)
    {
        var state = await stateFactory.GetState();
        return state.Current.state.Repositories.GetRepository(entityType).TryGetById(id) ?? throw new InvalidOperationException($"Entity not found: {id}.");
    }

    private EventBase PrepareForUpsert<T>(States state, ref T entity, out string verb)
        where T : EntityBase
    {
        var (parentId, revision) = state.Current.state.GetNextEventParentIdAndRevision();
        switch (entity.Id)
        {
            case -1:
                verb = "Creating";
                return new Creation(entity = entity with { Id = state.Current.state.Repositories.GetRepository<T>().GetNextNormalId() }, DateTime.UtcNow, Guid.NewGuid(), parentId, revision);
            case 0 or < -1:
                throw new("To update an entity, specify its id. To create an entity, pass the value -1 as the id field of the entity parameter.");
            default:
                verb = "Updating";
                return new Update(entity, DateTime.UtcNow, Guid.NewGuid(), parentId, revision);
        }
    }
}