using Economy.Common;
using Economy.Engine.Models.Internal;

namespace Economy.Engine.Services;

public interface IStateFactory<TState>
    where TState : IState
{
    Task<TState> GetState();
    Task InitializeDetached(IStateFactory<TState> from);
    Task Save();

    internal Task<UserData<TState>> GetUserData();
}