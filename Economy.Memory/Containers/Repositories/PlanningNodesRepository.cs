using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Root;

namespace Economy.Memory.Containers.Repositories;

public class PlanningNodesRepository(Repositories repositories)
    : Repository<PlanningNode>(repositories)
{
    protected override void ValidateUpdate(PlanningNode oldEntity, PlanningNode newEntity)
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

    public IEnumerable<PlanningNode> GetParents(PlanningNode planningNode)
    {
        if (planningNode.ParentId == null) 
            yield break;

        var parent = this[planningNode.ParentId.Value];
        yield return parent;

        foreach (var other in GetParents(parent))
        {
            yield return other;
        }
    }

    public IEnumerable<(PlanningNode plan, int depth)> GetPlanningNodeTree(int? parentId = null, int depth = 0)
    {
        foreach (var childPlan in GetAll().Where(b => b.ParentId == parentId).OrderBy(x => x.Id).ToList())
        {
            yield return (childPlan, depth);
            foreach (var grandChildPlan in GetPlanningNodeTree(childPlan.Id, depth + 1))
            {
                yield return grandChildPlan;
            }
        }
    }
}