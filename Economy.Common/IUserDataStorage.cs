namespace Economy.Common;

public interface IUserDataStorage
{
    string GetUserKey();

    Task<byte[]?> GetUserData();

    Task SaveUserData(byte[] data);
}