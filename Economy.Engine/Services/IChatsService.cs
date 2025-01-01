using Economy.AiInterface.Interfaces;
using Economy.Engine.Models;

namespace Economy.Engine.Services;

public interface IChatsService
{
    Task GotMessage(ChatsServiceContext context, Guid chatId, string messageId, string message);
    Task GotAudio(ChatsServiceContext context, Guid chatId, string messageId, byte[] audioData);
    Task<StateModel> GetState(ChatsServiceContext context);
    Task TryCancel(ChatsServiceContext context, Guid chatId, string messageId);
    Task CloseChat(ChatsServiceContext context, Guid chatId);
    Task OnFunctionInvokedAsync(ChatsServiceContext context, Guid chatId, FunctionInvocationLog log);
}