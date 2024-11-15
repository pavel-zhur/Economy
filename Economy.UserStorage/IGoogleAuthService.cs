namespace Economy.UserStorage;

public interface IGoogleAuthService
{
    Task<string> GetAccessTokenAsync();
}