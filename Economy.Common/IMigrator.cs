namespace Economy.Common;

public interface IMigrator<TState>
    where TState : IState
{
    byte[] SaveToBinary(TState state);
    TState LoadFromBinary(byte[]? data);
    TState CreateEmpty();
}