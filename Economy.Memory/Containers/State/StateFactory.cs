namespace Economy.Memory.Containers.State;

public class StateFactory
{
    public State CreateEmpty()
    {
        var empty = new State();
        // todo: async
        empty.LoadFromFile().Wait();
        return empty;
    }
}
