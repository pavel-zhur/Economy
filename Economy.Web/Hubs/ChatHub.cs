using Economy.AiInterface.Scope;
using Economy.UserStorage;
using Economy.Web.Hubs.Models;
using Economy.Web.Tools;
using Microsoft.AspNetCore.SignalR;

namespace Economy.Web.Hubs;

public class ChatHub(ILogger<ChatHub> logger, ChatsService chatsService, IUserDataStorage userDataStorage) : Hub
{
    public async Task SendMessage(string randomChatId, string randomMessageId, string message)
    {
        await ProcessSafe(async userId =>
        {
            await chatsService.GotMessage(userDataStorage, userId, randomChatId, randomMessageId, message);
        });
    }

    public async Task SendAudio(string randomChatId, string randomMessageId, byte[] audioData)
    {
        await ProcessSafe(async userId =>
        {
            await chatsService.GotAudio(userDataStorage, userId, randomChatId, randomMessageId, audioData);
        });
    }

    public async Task Hello()
    {
        await ProcessSafe(async userId =>
        {
            var state = await chatsService.GetState(userDataStorage, userId);
            await RespondSafe(ChatHubClientMethods.HelloResponse, state);
        });
    }

    public async Task TryCancel(string randomMessageId, string randomChatId)
    {
        await ProcessSafe(async userId =>
        {
            await chatsService.TryCancel(userId, randomChatId, randomMessageId);
        });
    }

    public async Task CloseChat(string randomChatId)
    {
        await ProcessSafe(async userId =>
        {
            await chatsService.CloseChat(userDataStorage, userId, randomChatId);
        });
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        logger.LogInformation($"User {Context.UserIdentifier} connected");

        await ProcessSafe(_ => Task.CompletedTask);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        logger.LogInformation($"User {Context.UserIdentifier} disconnected");
    }
    
    private async Task ProcessSafe(Func<string, Task> action)
    {
        try
        {
            await action(GetUserId());
        }
        catch (ReauthenticationNeededException)
        {
            try
            {
                await RespondAuthenticationNeeded();
            }
            catch (Exception e)
            {
                logger.LogError(e, "Exception sending the reauthentication response.");
            }
            finally
            {
                Context.Abort();
            }
        }
        catch (Exception e)
        {
            logger.LogError(e, "Exception processing the incoming chat hub message.");
            await RespondSafe(ChatHubClientMethods.HelloResponse, GetFatalErrorHelloResponse(), "fatal error");
            Context.Abort();
        }
    }

    private static StateModel GetFatalErrorHelloResponse() =>
        new(
            0, 
            [
                new(
                    string.Empty, 
                    [
                        new(
                            DateTime.UtcNow, 
                            MessageType.ServerText, 
                            null,
                            "A server error occurred. A page refresh could help.",
                            null,
                            SystemMessageSeverity.Error)
                    ],
                    ChatStatus.FatalError
                )
            ]);

    private string GetUserId()
    {
        if (Context.User?.Identity?.IsAuthenticated != true)
        {
            throw new ReauthenticationNeededException("Authentication check failed.");
        }

        return Context.UserIdentifier ?? throw new ReauthenticationNeededException("Authentication check 2 failed.");
    }

    private async Task RespondAuthenticationNeeded()
    {
        await RespondSafe(ChatHubClientMethods.Authenticate);
    }

    private async Task RespondSafe(string method, object? arg1 = null, string? useCase = "default")
    {
        try
        {
            await Clients.Caller.SendAsync(method, arg1);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Exception sending the {method} response, use case {useCase}.", method, useCase);
        }
    }
}