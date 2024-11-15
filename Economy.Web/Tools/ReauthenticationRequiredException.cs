namespace Economy.Web.Tools;

public class ReauthenticationRequiredException : Exception
{
    public ReauthenticationRequiredException(string message) : base(message) { }
}