using Economy.AiInterface.Interfaces;
using Economy.Engine.Enums;
using Economy.Engine.Models;
using Microsoft.Extensions.Logging;

namespace Economy.Engine.Services.Implementation;

internal class AiProcessingLogger(ILogger<AiProcessingLogger> logger) : IAiProcessingLogger
{
    private readonly Lock _lock = new();
    private (IChatsService chatsService, Guid chatId, ChatsServiceContext context)? _data;

    public void SetCurrentChatId((IChatsService chatsService, Guid chatId, ChatsServiceContext context)? data)
    {
        lock (_lock)
        {
            if (data != null && _data != null)
            {
                throw new InvalidOperationException($"Existing current chat id: {_data.Value.chatId}, new chat id: {data.Value.chatId}.");
            }

            _data = data;
        }
    }

    public void OnFunctionInvoked(FunctionInvocationLog log)
    {
        OnFunctionInvokedAsync(log);
    }

    private async void OnFunctionInvokedAsync(FunctionInvocationLog log)
    {
        try
        {
            await _data.Value.chatsService.OnFunctionInvokedAsync(_data.Value.context, _data.Value.chatId, log);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error during async function log processing.");
        }
    }
}