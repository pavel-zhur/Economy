using Economy.Memory.Models.State.Root;

namespace Economy.Memory.Containers.Repositories;

public class PlansRepository(Repositories repositories)
    : Repository<Plan>(repositories)
{
    private readonly Dictionary<int, List<int>> _children = new();
    private const int RootPlanId = 0;

    public IEnumerable<Plan> GetParents(Plan plan)
    {
        if (plan.ParentPlanId == null) 
            yield break;

        var parent = this[plan.ParentPlanId.Value];
        yield return parent;

        foreach (var other in GetParents(parent))
        {
            yield return other;
        }
    }

    public IEnumerable<(Plan plan, int depth)> GetPlanTree(int? parentPlanId = null, int depth = 0)
    {
        foreach (var childPlanId in (_children.GetValueOrDefault(parentPlanId ?? RootPlanId) ?? []).OrderBy(x => x).ToList())
        {
            yield return (this[childPlanId], depth);
            foreach (var grandChildPlan in GetPlanTree(childPlanId, depth + 1))
            {
                yield return grandChildPlan;
            }
        }
    }

    public IEnumerable<Plan> GetChildren(int? planId)
    {
        return _children.GetValueOrDefault(planId ?? RootPlanId)?.Select(x => this[x]) ?? [];
    }

    protected override void OnAdded(Plan entity)
    {
        base.OnAdded(entity);

        var entityParentPlanId = entity.ParentPlanId ?? RootPlanId;
        if (!_children.ContainsKey(entityParentPlanId))
        {
            _children[entityParentPlanId] = new();
        }

        _children[entityParentPlanId].Add(entity.Id);
    }

    protected override void OnDeleted(Plan entity)
    {
        base.OnDeleted(entity);

        var entityParentPlanId = entity.ParentPlanId ?? RootPlanId;
        _children[entityParentPlanId].Remove(entity.Id);
    }

    protected override void OnUpdated(Plan oldEntity, Plan newEntity)
    {
        base.OnUpdated(oldEntity, newEntity);

        var oldEntityParentPlanId = oldEntity.ParentPlanId ?? RootPlanId;
        var newEntityParentPlanId = newEntity.ParentPlanId ?? RootPlanId;
        if (oldEntityParentPlanId != newEntityParentPlanId)
        {
            _children[oldEntityParentPlanId].Remove(oldEntity.Id);

            if (!_children.ContainsKey(newEntityParentPlanId))
            {
                _children[newEntityParentPlanId] = new();
            }

            _children[newEntityParentPlanId].Add(newEntity.Id);
        }
    }

    protected override void ValidateUpdate(Plan oldEntity, Plan newEntity)
    {
        // newEntity.ParentPlanId may create a loop. Plans are a tree.
        if (newEntity.ParentPlanId != null)
        {
            var parents = GetParents(this[newEntity.ParentPlanId.Value]).Select(x => x.Id).ToList();
            if (parents.Contains(newEntity.Id))
            {
                throw new InvalidOperationException("Parent plan id creates a loop.");
            }
        }
    }
}