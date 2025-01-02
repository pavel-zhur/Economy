using System.Text.Json;
using System.Text.Json.Serialization;
using Economy.Memory.Containers.State;
using Economy.Memory.Migrations.EventSourcing;
using Economy.Memory.Migrations.Ex;
using Economy.Memory.Migrations.V3.Root;
using Economy.Memory.Migrations.V3.Sub;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;
using OneShelf.Common;

namespace Economy.Memory.Migrations.Services;

internal class MigratorV3
{
    public void Apply(State state, IReadOnlyList<ExEventBase> events, JsonSerializerOptions futureJsonSerializerOptions)
    {
        var exJsonSerializerOptions = new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        };

        var v3Plans = new Dictionary<int, V3Plan>();
        var v3Transactions = new Dictionary<int, V3Transaction>();

        foreach (var @event in events)
        {
            var (parentId, revision) = state.GetNextEventParentIdAndRevision();

            switch (@event)
            {
                case ExCreation exCreation when Enum.TryParse<ExV3EntityType>(exCreation.Entity.Type, out var entityType) && entityType == ExV3EntityType.Transaction:
                    var v3Transaction = JsonSerializer.Deserialize<V3Transaction>(exCreation.Entity.Data.ToJsonString(), exJsonSerializerOptions)!;
                    v3Transactions[v3Transaction.Id] = v3Transaction;
                    state.Apply(new Creation(Convert(state, v3Transaction), exCreation.CreatedOn, Guid.NewGuid(), parentId, revision));
                    break;
                case ExCreation exCreation when Enum.TryParse<ExV3EntityType>(exCreation.Entity.Type, out var entityType) && entityType == ExV3EntityType.Plan:
                    var v3Plan = JsonSerializer.Deserialize<V3Plan>(exCreation.Entity.Data.ToJsonString(), exJsonSerializerOptions)!;
                    v3Plans[v3Plan.Id] = v3Plan;
                    state.Apply(new Creation(Convert(state, v3Plan), exCreation.CreatedOn, Guid.NewGuid(), parentId, revision));
                    break;
                case ExUpdate exUpdate when Enum.TryParse<ExV3EntityType>(exUpdate.Entity.Type, out var entityType) && entityType == ExV3EntityType.Transaction:
                    v3Transaction = JsonSerializer.Deserialize<V3Transaction>(exUpdate.Entity.Data.ToJsonString(), exJsonSerializerOptions)!;
                    v3Transactions[v3Transaction.Id] = v3Transaction;
                    state.Apply(new Update(Convert(state, v3Transaction), exUpdate.CreatedOn, Guid.NewGuid(), parentId, revision));
                    break;
                case ExUpdate exUpdate when Enum.TryParse<ExV3EntityType>(exUpdate.Entity.Type, out var entityType) && entityType == ExV3EntityType.Plan:
                    v3Plan = JsonSerializer.Deserialize<V3Plan>(exUpdate.Entity.Data.ToJsonString(), exJsonSerializerOptions)!;
                    v3Plans[v3Plan.Id] = v3Plan;
                    state.Apply(new Update(Convert(state, v3Plan), exUpdate.CreatedOn, Guid.NewGuid(), parentId, revision));
                    break;
                case ExCreation exCreation:
                    state.Apply(JsonSerializer.Deserialize<Creation>(JsonSerializer.Serialize(exCreation), futureJsonSerializerOptions)!);
                    break;
                case ExUpdate exUpdate:
                    state.Apply(JsonSerializer.Deserialize<Update>(JsonSerializer.Serialize(exUpdate), futureJsonSerializerOptions)!);
                    break;
                case ExDeletion exDeletion:
                    state.Apply(JsonSerializer.Deserialize<Deletion>(JsonSerializer.Serialize(exDeletion), futureJsonSerializerOptions)!);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(@event));
            }
        }

        foreach (var transaction in state.Repositories.Transactions.GetAll())
        {
            var v3Transaction = v3Transactions[transaction.Id];
            if (v3Transaction is { Planned: { Amounts: { } amounts } planned, Actual: null })
            {
                var (parentId, revision) = state.GetNextEventParentIdAndRevision();
                state.Apply(new Deletion(transaction.GetFullId(), DateTime.UtcNow, Guid.NewGuid(), parentId, revision));

                (parentId, revision) = state.GetNextEventParentIdAndRevision();
                state.Apply(new Creation(new Plan(
                    state.Repositories.Plans.GetNextNormalId(),
                    transaction.SpecialNotes ?? "[converted]",
                    null,
                    transaction.PlanId,
                    new(
                        v3Transaction.Type switch
                        {
                            TransactionType.Income => PlanExpectedFinancialActivityType.ExpectedIncome,
                            TransactionType.Expense => PlanExpectedFinancialActivityType.ExpectedExpense,
                            _ => throw new ArgumentOutOfRangeException(),
                        },
                        amounts,
                        null,
                        planned.Date)), 
                    DateTime.UtcNow, Guid.NewGuid(), parentId, revision));
            }
        }
    }

    private static Transaction Convert(State state, V3Transaction transaction) => new(
        transaction.Id, 
        (transaction.Actual != null, transaction.Planned != null) switch
        {
            (true, false) => transaction.SpecialNotes ?? state.Repositories.Plans[transaction.PlanId].Name,
            (false, true) => "[converted] planned only. todo.",
            (true, true) when transaction.Planned.Amounts.ToEquivalentAmount(state.Repositories).Amount == transaction.Actual.Amounts.ToEquivalentAmount(state.Repositories).Amount => transaction.SpecialNotes ?? state.Repositories.Plans[transaction.PlanId].Name,
            (true, true) => $"[converted] actual & planned. planned: {transaction.Planned!.Date} {transaction.Planned.Amounts.ToDetails(state.Repositories)}",
            _ => throw new ArgumentOutOfRangeException(),
        },
        null,
        transaction.Type,
        transaction.Actual?.DateAndTime ?? transaction.Planned!.Date.ToDateTime(),
        transaction.Actual?.Amounts ?? transaction.Planned!.Amounts,
        transaction.PlanId,
        null,
        null);

    private static Plan Convert(State state, V3Plan plan) => new(
        plan.Id, 
        plan.Name,
        plan.SpecialNotes,
        plan.ParentPlanId,
        Convert(plan.Schedule));

    private static PlanExpectedFinancialActivity? Convert(V3PlanSchedule? planSchedule) 
        => planSchedule == null 
            ? null 
            : new PlanExpectedFinancialActivity(
                PlanExpectedFinancialActivityType.ExpectedExpense,
                planSchedule.Amounts.Select(x => x with
                {
                    Value = x.Value * (int)(planSchedule.FinishDate.ToDateTime() - planSchedule.StartDate.ToDateTime()).TotalDays
                }).SelectSingle(x =>
                {
                    if (x == null)
                        return null;
                    var amounts = new Amounts();
                    amounts.AddRange(x);
                    return amounts;
                }),
                new(
                    new(planSchedule.StartDate, planSchedule.FinishDate), 
                    planSchedule.Schedule == RecurringInterval.Daily ? RecurringInterval.Daily : throw new ArgumentOutOfRangeException(nameof(planSchedule), "Only daily conversion is supported."), 
                    RecurringAmountsBalancingBehavior.Mix),
                null);
}