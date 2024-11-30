namespace Economy.Common;

public interface IMigrator<in TState>
    where TState : IState
{
    byte[] SaveToBinary(TState state);
    void LoadFromBinary(TState state, byte[]? data);
}