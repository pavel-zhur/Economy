namespace Economy.Common;

public interface IState
{
    byte[] SaveToBinary();
    void LoadFromBinary(byte[]? data);
}