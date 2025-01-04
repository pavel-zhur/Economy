using Economy.Common;
using Economy.Memory.Models.Branching;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Base;
using OneShelf.Common;

namespace Economy.Memory.Containers.State;

using Repositories;

public class States
{
    private readonly Dictionary<int, State> _branchStates;
    private readonly Dictionary<int, int> _branchParents;
    private readonly List<Branch> _branches;
    private readonly Dictionary<int, List<int>> _branchesByParentBranchId;

    private States(Dictionary<int, State> branchStates, Dictionary<int, int> branchParents, Branch current, Branch emptyRoot, List<Branch> branches)
    {
        _branchStates = branchStates;
        _branchParents = branchParents;
        Current = (current, branchStates[current.Id]);
        EmptyRoot = emptyRoot;
        _branches = branches;
        _branchesByParentBranchId = branchParents.GroupBy(x => x.Value)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Key).ToList());
    }

    public (Branch? branch, State state) Current { get; private set; }
    
    public Branch EmptyRoot { get; }
    public IReadOnlyDictionary<int, int> BranchParents => _branchParents;
    public IReadOnlyDictionary<int, State> BranchStates => _branchStates;

    public IReadOnlyList<Branch> Branches => _branches;

    public IEnumerable<int> GetChildBranchIds(int parentBranchId) =>
        _branchesByParentBranchId.GetValueOrDefault(parentBranchId) ?? [];

    public void CheckoutBranch(int branchId)
    {

    }

    public void CheckoutDetached(int branchId, int revisionNumber)
    {

    }

    public void Apply(EventBase @event)
    {
        switch (Current.branch?.Status)
        {
            case BranchStatus.Draft:
                Current.state.Apply(@event);
                Current = Current with
                {
                    branch = Current.branch with
                    {
                        TipEventId = @event.Id
                    }
                };

                return;

            case BranchStatus.Committed:
            {
                var currentBranchId = Current.branch.Id;
                var newState = new State();
                newState.AddFromWithoutValidation(Current.state);
                newState.Apply(@event);
                var newBranch = new Branch(Branches.Count, null, BranchStatus.Draft, @event.Id);

                _branches.Add(newBranch);
                (_branchesByParentBranchId.TryGetValue(currentBranchId, out var list)
                    ? list
                    : _branchesByParentBranchId[currentBranchId] = new())
                    .Add(newBranch.Id);
                _branchParents[newBranch.Id] = currentBranchId;
                _branchStates[newBranch.Id] = newState;

                return;
            }

            case null:

        }
    }

    public void Commit()
    {

    }

    public void CommitNewBranch()
    {

    }

    public (List<EventBase> events, List<Branch> branches) Dump()
    {
        return (_branchStates.SelectMany(x => x.Value.Events).DistinctBy(x => x.Id).ToList(),
            Branches.ToList());
    }

    public static States Load(IReadOnlyList<EventBase> events, IEnumerable<Branch> branches)
    {
        branches = branches.OrderBy(x => x.Id).ToList();
        if (branches.WithIndices().Any(x => x.i != x.x.Id))
        {
            throw new InvalidOperationException("Branches are not ordered.");
        }

        var eventsByParentId = events.ToLookup(e => e.ParentId);
        var branchesByTip = branches.Where(x => x.TipEventId.HasValue).ToDictionary(b => b.TipEventId!.Value);
        var emptyRoot = branches.Single(x => x.TipEventId == null);

        if (emptyRoot.Id != 0)
        {
            throw new InvalidOperationException("Root branch must have id 0.");
        }

        if (events.Any(e => !eventsByParentId[e.Id].Any() && !branchesByTip.ContainsKey(e.Id)))
        {
            throw new InvalidOperationException("Event is not referenced by any other event or branch.");
        }

        var branchStates = new Dictionary<int, State>();
        var branchParents = new Dictionary<int, int>();

        void TraverseEvents(Guid? lastAppliedEventId, State currentState, int? lastBranchId)
        {
            while (true)
            {
                // Assign state to branch if a branch points to the current event
                var stateCaptured = (Branch?)null;
                if (lastAppliedEventId.HasValue && branchesByTip.TryGetValue(lastAppliedEventId.Value, out var branch))
                {
                    branchStates.Add(branch.Id, currentState);
                    branchParents[branch.Id] = lastBranchId!.Value;
                    stateCaptured = branch;
                }
                else if (!lastAppliedEventId.HasValue)
                {
                    branchStates.Add(0, currentState);
                    stateCaptured = emptyRoot;
                }

                var children = eventsByParentId[lastAppliedEventId].ToList();
                if (children.Count > 1)
                {
                    if (stateCaptured == null)
                    {
                        throw new InvalidOperationException("Branching event must have its own state.");
                    }

                    foreach (var childEvent in children)
                    {
                        var clonedState = new State();
                        clonedState.AddFromWithoutValidation(currentState);
                        clonedState.Apply(childEvent);
                        TraverseEvents(childEvent.Id, clonedState, stateCaptured.Id);
                    }
                }
                else if (children.Any())
                {
                    currentState.Apply(children.Single());
                    continue;
                }

                break;
            }
        }

        // Start recursive DFS from the root (null parent)
        TraverseEvents(null, new(), null);

        var current = branches.Last();

        return new(branchStates, branchParents, current, emptyRoot, branches.ToList());
    }
}

public class State : IState
{
    private readonly Dictionary<EntityFullId, List<EventBase>> _eventsByEntityFullId = new();
    private readonly List<EventBase> _events = new();

    public IReadOnlyList<EventBase> Events => _events;

    public Repositories Repositories { get; } = new();

    public string UniqueIdentifier => (Events.LastOrDefault()?.Id ?? Guid.Empty).ToString();

    public IReadOnlyList<EventBase> GetEventsByEntityFullId(EntityFullId entityFullId) => _eventsByEntityFullId[entityFullId];

    internal void Apply(EventBase @event)
    {
        var (parentId, revision) = GetNextEventParentIdAndRevision();
        if (@event.ParentId != parentId || @event.Revision != revision)
        {
            throw new InvalidOperationException($"Invalid event: expected parent id {parentId} and revision {revision}, but got {@event.ParentId} and {@event.Revision}.");
        }

        switch (@event)
        {
            case Creation creation:
                Repositories
                    .GetRepository(creation.Entity.GetEntityType())
                    .Add(creation.Entity);
                _eventsByEntityFullId[creation.Entity.GetFullId()] = [creation];
                break;
            case Deletion deletion:
                Repositories
                    .GetRepository(deletion.EntityFullId.Type)
                    .Delete(deletion.EntityFullId.Id);
                _eventsByEntityFullId[deletion.EntityFullId].Add(deletion);
                break;
            case Update update:
                Repositories
                    .GetRepository(update.Entity.GetEntityType())
                    .Update(update.Entity);
                _eventsByEntityFullId[update.Entity.GetFullId()].Add(update);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(@event));
        }

        _events.Add(@event);
    }

    public (Guid? parentId, int revision) GetNextEventParentIdAndRevision()
    {
        return (parentId: Events.Any() ? Events[^1].Id : null, revision: Events.Count + 1);
    }

    internal IHistory CreateHistorySnapshot(int revision) => new StateSnapshot(this, revision);

    internal void AddFromWithoutValidation(State another)
    {
        if (_events.Any() || _events.Any() || Repositories.AllByEntityType.Values.Any(x => x.GetAll().Any()))
        {
            throw new InvalidOperationException("State is not empty.");
        }

        _events.AddRange(another._events);
        _eventsByEntityFullId.AddRange(another._eventsByEntityFullId.Select(x => (x.Key, x.Value.ToList())), false);
        Repositories.AddFromWithoutValidation(another.Repositories);
    }
}