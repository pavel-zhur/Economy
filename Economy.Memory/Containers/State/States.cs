﻿using Economy.Common;
using Economy.Memory.Models.Branching;
using Economy.Memory.Models.EventSourcing;
using OneShelf.Common;

namespace Economy.Memory.Containers.State;

public class States : IState
{
    private readonly Dictionary<int, State> _branchStates;
    private readonly Dictionary<int, int> _branchParents;
    private readonly List<Branch> _branches;
    private readonly Dictionary<int, List<int>> _branchesByParentBranchId;
    private int _events;

    private States(Dictionary<int, State> branchStates, Dictionary<int, int> branchParents, Branch current,
        Branch emptyRoot, List<Branch> branches, int events)
    {
        _events = events;
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
        Current = (Branches.Single(x => x.Id == branchId), _branchStates[branchId]);
    }

    public void CheckoutDetached(int branchId, int revisionNumber)
    {
        while (true)
        {
            if (_branchStates[branchId].Events.Count == revisionNumber)
            {
                CheckoutBranch(branchId);
                return;
            }

            if (_branchStates[_branchParents[branchId]].Events.Count >= revisionNumber)
            {
                branchId = _branchParents[branchId];
                continue;
            }

            var state = new State();
            state.AddFromWithoutValidation(_branchStates[_branchParents[branchId]]);
            foreach (var @event in _branchStates[branchId].Events.Take(revisionNumber).Skip(state.Events.Count))
            {
                state.Apply(@event);
            }

            Current = (null, state);
            break;
        }
    }

    public void Apply(EventBase @event)
    {
        switch (Current.branch?.Status)
        {
            case BranchStatus.Draft:
                Current.state.Apply(@event);
                Current = Current with
                {
                    branch = _branches[Current.branch.Id] = Current.branch with
                    {
                        TipEventId = @event.Id
                    }
                };

                break;

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

                    Current = (newBranch, newState);

                    break;
                }

            case null:
                {
                    var oldTip = Current.state.Events[^1];
                    var oldBranchId = _branchStates.Where(x => x.Key != EmptyRoot.Id).Single(x => x.Value.Events.Skip(_branchStates[_branchParents[x.Key]].Events.Count).Any(e => e.Id == @event.Id)).Key;
                    var fork = new Branch(_branches.Count, null, BranchStatus.Committed, oldTip.Id);
                    if (!_branchesByParentBranchId[_branchParents[oldBranchId]].Remove(oldBranchId))
                    {
                        throw new InvalidOperationException("Branch is not a child of its parent.");
                    }

                    _branchesByParentBranchId[fork.Id] = [oldBranchId];

                    _branchParents[fork.Id] = _branchParents[oldBranchId];
                    _branchParents[oldBranchId] = fork.Id;

                    _branches.Add(fork);
                    _branchStates[fork.Id] = Current.state;

                    Current = Current with
                    {
                        branch = fork
                    };

                    Apply(@event);

                    break;
                }

            default:
                throw new InvalidOperationException($"Invalid branch status: {Current.branch.Status}.");
        }

        _events++;
    }

    public void Commit()
    {
        throw new NotImplementedException();
    }

    public void CommitNewBranch()
    {
        throw new NotImplementedException();
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
                    lastBranchId = branch.Id;
                }
                else if (!lastAppliedEventId.HasValue)
                {
                    branchStates.Add(emptyRoot.Id, currentState);
                    stateCaptured = emptyRoot;
                    lastBranchId = emptyRoot.Id;
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
                    lastAppliedEventId = children.Single().Id;
                    continue;
                }

                break;
            }
        }

        // Start recursive DFS from the root (null parent)
        TraverseEvents(null, new(), null);

        var current = branches.Last();

        return new(branchStates, branchParents, current, emptyRoot, branches.ToList(), events.Count);
    }

    public string UniqueIdentifier => _events.ToString();
}