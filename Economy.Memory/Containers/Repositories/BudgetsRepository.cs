using Economy.Memory.Models.State;

namespace Economy.Memory.Containers.Repositories;

public class BudgetsRepository(Repositories repositories, string idPrefix)
    : Repository<Budget>(repositories, idPrefix)
{
    protected override void ValidateUpdate(Budget oldEntity, Budget newEntity)
    {
        // newEntity.ParentBudgetId may create a loop. Budgets are a tree.
        if (newEntity.ParentBudgetId != null)
        {
            var parents = GetParents(GetById(newEntity.ParentBudgetId)!).Select(x => x.Id).ToList();
            if (parents.Contains(newEntity.Id))
            {
                throw new InvalidOperationException("Parent budget id creates a loop.");
            }
        }
    }

    public IEnumerable<Budget> GetParents(Budget budget)
    {
        if (budget.ParentBudgetId == null) 
            yield break;

        var parent = GetById(budget.ParentBudgetId)!;
        yield return parent;

        foreach (var other in GetParents(parent))
        {
            yield return other;
        }
    }
}