using Economy.Memory.Models.Reports;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Sub;
using Economy.Memory.Tools;

namespace Economy.Memory.Mathematics;

public static class PlansMathematics
{
    public static List<PlanRecord> CreateRecords(Containers.State.State state)
    {
        var result = new List<PlanRecord>();

        foreach (var plan in state.Repositories.Plans.GetAll())
        {
            result.Add(new PlanActionRecord(
                state.GetEventsByEntityFullId(plan.GetFullId())[0].CreatedOn.Date.ToDate(),
                PlanActionRecordType.Created,
                plan.Id));
        }

        foreach (var @event in state.Repositories.Events.GetAll())
        {
            result.Add(new PlanEventRecord(@event.Date, @event));
        }

        foreach (var transfer in state.Repositories.Transfers.GetAll())
        {
            result.Add(new PlanFlow2Record(
                transfer.Date,
                new Amounts
                {
                    transfer.Amount
                }.ToEquivalentAmount(state.Repositories).Amount,
                PlanFlowRecordType.Transfer,
                transfer.ToPlanId,
                transfer.FromPlanId));
        }

        foreach (var transaction in state.Repositories.Transactions.GetAll())
        {
            result.Add(new PlanFlow1Record(
                transaction.DateAndTime.ToDate(),
                transaction.Amounts.ToEquivalentAmount(state.Repositories).Amount * transaction.Type switch
                {
                    TransactionType.Income => 1,
                    TransactionType.Expense => -1,
                    _ => throw new ArgumentOutOfRangeException(),
                },
                transaction.Type switch
                {
                    TransactionType.Income => PlanFlowRecordType.ActualIncome,
                    TransactionType.Expense => PlanFlowRecordType.ActualExpense,
                },
                transaction.PlanId));
        }

        foreach (var plan in state.Repositories.Plans.GetAll())
        {
            if (plan.ExpectedFinancialActivity is { } amount)
            {
                if (amount.PlannedRecurringDates is { } schedule)
                {
                    var occurrences = new List<Date>();
                    for (var current = schedule.Period.StartDate.ToDateTime();
                         current <= schedule.Period.EndDate.ToDateTime();
                         current = schedule.Interval switch
                         {
                             RecurringInterval.Daily => current.AddDays(1),
                             RecurringInterval.Weekly => current.AddDays(7),
                             RecurringInterval.Monthly => current.AddMonths(1),
                             _ => throw new ArgumentOutOfRangeException(),
                         })
                    {
                        occurrences.Add(current.ToDate());
                    }

                    foreach (var occurrence in occurrences)
                    {
                        result.Add(new PlanFlow2Record(
                            occurrence,
                            System.Math.Round(amount.Amounts.ToEquivalentAmount(state.Repositories).Amount / occurrences.Count,
                                2,
                                amount.Type switch
                                {
                                    PlanExpectedFinancialActivityType.ExpectedExpense => MidpointRounding.ToPositiveInfinity,
                                    PlanExpectedFinancialActivityType.ExpectedIncome => MidpointRounding.ToNegativeInfinity,
                                }) * amount.Type switch
                            {
                                PlanExpectedFinancialActivityType.ExpectedExpense => -1,
                                PlanExpectedFinancialActivityType.ExpectedIncome => 1,
                                _ => throw new ArgumentOutOfRangeException(),
                            },
                            amount.Type switch
                            {
                                PlanExpectedFinancialActivityType.ExpectedExpense => PlanFlowRecordType.ExpectedExpense,
                                PlanExpectedFinancialActivityType.ExpectedIncome => PlanFlowRecordType.ExpectedIncome,
                                _ => throw new ArgumentOutOfRangeException(),
                            },
                            plan.ParentPlanId,
                            plan.Id));
                    }
                }
                else
                {
                    result.Add(new PlanFlow2Record(
                        amount.PlannedDate!.Value,
                        amount.Amounts.ToEquivalentAmount(state.Repositories).Amount * amount.Type switch
                        {
                            PlanExpectedFinancialActivityType.ExpectedExpense => -1,
                            PlanExpectedFinancialActivityType.ExpectedIncome => 1,
                            _ => throw new ArgumentOutOfRangeException(),
                        },
                        amount.Type switch
                        {
                            PlanExpectedFinancialActivityType.ExpectedExpense => PlanFlowRecordType.ExpectedExpense,
                            PlanExpectedFinancialActivityType.ExpectedIncome => PlanFlowRecordType.ExpectedIncome,
                            _ => throw new ArgumentOutOfRangeException(),
                        },
                        plan.ParentPlanId,
                        plan.Id));
                }
            }
        }

        result = result.OrderBy(x => x.Date).ToList();

        return result;
    }

    public static (
        Dictionary<int, IReadOnlyPlanTotals> totalsByPlanId,
        IReadOnlyPlanTotals planlessRecordsTotals,
        IReadOnlyPlanTotals grandTotal)
        CalculateTotals(
        Containers.State.State state, List<PlanRecord> records)
    {
        var groups = records
            .SelectMany(r => r.PlanIds.Select(p => (p, r)))
            .GroupBy(x => x.p.planId)
            .ToList();

        var totalsByPlanId = groups
            .Where(x => x.Key.HasValue)
            .ToDictionary(
                g => g.Key!.Value,
                g => new PlanTotals(
                    g
                        .Select(r => (r.r.Date, r.r.Flow * (r.p.reverse ? -1 : 1), r.r))
                        .OrderBy(r => r.Date)
                        .ToList()));

        var planlessRecordsTotals = new PlanTotals(
            groups
                .SingleOrDefault(x => x.Key == null)
                ?.Select(r => (r.r.Date, r.r.Flow * (r.p.reverse ? -1 : 1), r.r))
                .OrderBy(r => r.Date)
                .ToList()
            ?? []);

        foreach (var (planId, totals) in totalsByPlanId)
        {
            totals.InitSubtree(state.Repositories.Plans.GetPlanTree(planId).Select(x => x.plan.Id).Append(planId).Select(x => totalsByPlanId[x]));
        }

        var grandTotal = new PlanTotals([]);
        grandTotal.InitSubtree(totalsByPlanId.Values.Append(grandTotal));

        return (
            totalsByPlanId.ToDictionary(x => x.Key, x => (IReadOnlyPlanTotals)x.Value),
            planlessRecordsTotals,
            grandTotal);
    }
}