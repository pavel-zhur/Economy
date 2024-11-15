using System.Security.Claims;
using Economy.AiInterface.Scope;
using Economy.UserStorage;
using Economy.Web.Tools;

namespace Economy.Web.Services;

public class UserDataStorage(IHttpContextAccessor httpContextAccessor, GoogleStorage googleStorage) : IUserDataStorage
{
    private const string FileNameTemplate = "c:/temp/{0}.json";

    public string GetUserKey()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user == null)
        {
            throw new ReauthenticationRequiredException("No user is currently logged in.");
        }

        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            throw new ReauthenticationRequiredException("User ID not found.");
        }

        return userId;
    }

    public async Task<byte[]?> GetUserData()
    {
        return await googleStorage.RetrieveUserData();
    }

    public async Task SaveUserData(byte[] data)
    {
        await googleStorage.StoreUserData(data);
    }

    public async Task CopyUserDataToFile()
    {
        var data = await googleStorage.RetrieveUserData();
        if (data == null)
        {
            throw new("User data not exists.");
        }

        var fileName = GetLocalFileName(GetUserKey());
        await File.WriteAllBytesAsync(fileName, data);
    }

    public async Task UploadUserDataFromFile()
    {
        var fileName = GetLocalFileName(GetUserKey());
        if (!File.Exists(fileName))
        {
            throw new("User data file not exists.");
        }

        var data = await File.ReadAllBytesAsync(fileName);
        await googleStorage.StoreUserData(data);
    }

    private static string GetLocalFileName(string userKey)
    {
        userKey = Path.GetInvalidFileNameChars().Append('.').Aggregate(userKey, (x, c) => x.Replace(c, '_'));

        return string.Format(FileNameTemplate, userKey);
    }
}