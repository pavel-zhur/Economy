namespace Economy.Implementation.Factories;

public interface IReadOnlyStateFactory<TState>
{
    Task<TState> GetState();
}