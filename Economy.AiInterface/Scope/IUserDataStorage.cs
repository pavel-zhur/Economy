namespace Economy.AiInterface.Scope;

public interface IUserDataStorage
{
    string GetUserKey();

    Task<byte[]?> GetUserData();

    Task SaveUserData(byte[] data);
}