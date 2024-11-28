using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Root;

namespace Economy.Memory.Containers.Repositories;

public class PlansRepository(Repositories repositories)
    : Repository<Plan>(repositories)
{
    protected override void ValidateUpdate(Plan oldEntity, Plan newEntity)
    {
        // newEntity.ParentPlanId may create a loop. Plans are a tree.
        if (newEntity.ParentId != null)
        {
            var parents = GetParents(this[newEntity.ParentId.Value]).Select(x => x.Id).ToList();
            if (parents.Contains(newEntity.Id))
            {
                throw new InvalidOperationException("Parent plan id creates a loop.");
            }
        }
    }

    public IEnumerable<Plan> GetParents(Plan plan)
    {
        if (plan.ParentId == null) 
            yield break;

        var parent = this[plan.ParentId.Value];
        yield return parent;

        foreach (var other in GetParents(parent))
        {
            yield return other;
        }
    }

    public IEnumerable<(Plan plan, int depth)> GetPlanTree(int? parentId = null, int depth = 0)
    {
        foreach (var childPlan in GetAll().Where(b => b.ParentId == parentId).OrderBy(x => x.Id).ToList())
        {
            yield return (childPlan, depth);
            foreach (var grandChildPlan in GetPlanTree(childPlan.Id, depth + 1))
            {
                yield return grandChildPlan;
            }
        }
    }
}