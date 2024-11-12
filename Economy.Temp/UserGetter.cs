using Economy.AiInterface.Scope;

namespace Economy.Temp;

public class UserGetter : IStateUserGetter
{
    public string GetStateUserKey() => "console_user1";
}