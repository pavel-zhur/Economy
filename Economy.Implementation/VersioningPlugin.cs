using System.ComponentModel;
using Economy.Engine.Services;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.Branching;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace Economy.Implementation;

internal class VersioningPlugin(ILogger<VersioningPlugin> logger, IStateFactory<States> stateFactory)
{
    [KernelFunction("get_branches")]
    [Description("Gets all branches")]
    public async Task<IReadOnlyList<Branch>> GetBranches()
    {
        var states = await stateFactory.GetState();
        return states.Branches;
    }

    [KernelFunction("checkout_branch")]
    [Description("Checks out a branch, i.e. switches to the given branch")]
    public async Task CheckoutBranch(int branchId)
    {
        var states = await stateFactory.GetState();
        states.CheckoutBranch(branchId);
    }

    [KernelFunction("checkout_detached")]
    [Description("Checks out a detached commit, i.e. switches to the given commit in the given branch")]
    public async Task CheckoutDetached(int branchId, int revisionNumber)
    {
        var states = await stateFactory.GetState();
        states.CheckoutDetached(branchId, revisionNumber);
    }

    [KernelFunction("rename_branch")]
    [Description("Renames a branch")]
    public async Task RenameBranch(int branchId, string? newName)
    {
        var states = await stateFactory.GetState();
        newName = string.IsNullOrWhiteSpace(newName) ? null : newName;
        states.RenameBranch(branchId, newName);
    }

    [KernelFunction("commit_branch")]
    [Description("Commits the current branch, i.e. saves the unsaved changes to the current branch")]
    public async Task CommitBranch()
    {
        var states = await stateFactory.GetState();
        states.Commit();
    }

    [KernelFunction("commit_to_new_branch")]
    [Description("Commits the current version to a new branch, i.e. saves the current draft branch. The branch name is optional.")]
    public async Task CommitToNewBranch(string? branchName)
    {
        var states = await stateFactory.GetState();
        states.CommitNewBranch(branchName);
    }
}