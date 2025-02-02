﻿using Economy.Engine.Services;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;

namespace Economy.Implementation.Factories;

internal class ReadOnlyStateFactory(IStateFactory<States> statesFactory) : IReadOnlyStateFactory<State>, IReadOnlyStateFactory<Repositories>, IReadOnlyStateFactory<States>
{
    async Task<State> IReadOnlyStateFactory<State>.GetState()
    {
        return (await statesFactory.GetState()).Current.state;
    }

    async Task<Repositories> IReadOnlyStateFactory<Repositories>.GetState()
    {
        return (await statesFactory.GetState()).Current.state.Repositories;
    }

    async Task<States> IReadOnlyStateFactory<States>.GetState()
    {
        return (await statesFactory.GetState());
    }
}