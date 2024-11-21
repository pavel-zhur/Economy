using Economy.AiInterface.Scope;
using Economy.Memory.Containers.State;
using Economy.UserStorage;
using Economy.Web.Hubs.Models;
using Economy.Web.Services;
using Economy.Web.Tools;
using Microsoft.AspNetCore.SignalR;
using Exception = System.Exception;

namespace Economy.Web.Hubs;

public class ChatHub(ILogger<ChatHub> logger, ChatsService chatsService, ChatsRenderer chatsRenderer, IUserDataStorage userDataStorage, IHubContext<ChatHub> hubContext, FactoriesMemory factoriesMemory) : Hub
{
    public async Task SendMessage(Guid chatId, string messageId, string message)
    {
        await Task.Delay(1000);

        await ProcessSafe(Context.ConnectionId, async (userId, state) =>
        {
            await chatsService.GotMessage(state, userId, chatId, messageId, message);
        });
    }

    public async Task SendAudio(Guid chatId, string messageId, byte[] audioData)
    {
        await ProcessSafe(Context.ConnectionId, async (userId, state) =>
        {
            await chatsService.GotAudio(state, userId, chatId, messageId, audioData);
        });
    }

    public async Task Hello()
    {
        var connectionId = Context.ConnectionId;
        await ProcessSafe(connectionId, async (userId, state) =>
        {
            var stateModel = await chatsService.GetState(state, userId);
            await RespondSafe(connectionId, ChatHubClientMethods.HelloResponse, stateModel);
        });
    }

    public async Task TryCancel(Guid chatId, string messageId)
    {
        await ProcessSafe(Context.ConnectionId, async (userId, _) =>
        {
            await chatsService.TryCancel(userId, chatId, messageId);
        });
    }

    public async Task CloseChat(Guid chatId)
    {
        await ProcessSafe(Context.ConnectionId, async (userId, state) =>
        {
            await chatsService.CloseChat(state, userId, chatId);
        });
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        logger.LogInformation($"User {Context.UserIdentifier} connected");

        await ProcessSafe(Context.ConnectionId, (_, _) => Task.CompletedTask);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        logger.LogInformation($"User {Context.UserIdentifier} disconnected");
    }

    private async Task ProcessSafe(string connectionId, Func<string, State, Task> action)
    {
        try
        {
            if (Context.User?.Identity?.IsAuthenticated != true)
            {
                throw new ReauthenticationNeededException("Authentication check failed.");
            }

            var userId = Context.UserIdentifier ?? throw new ReauthenticationNeededException("Authentication check 2 failed.");

            var (state, _) = await factoriesMemory.GetOrCreate(userDataStorage);
            
            Task.Delay(1000).ContinueWith(async _ => await action(userId, state)).Unwrap().ContinueWith(async t =>
            {
                logger.LogError(t.Exception, "Exception processing the incoming chat hub message.");

                try
                {
                    var stateModel = await chatsService.GetState(state, userId);
                    await RespondSafe(connectionId, ChatHubClientMethods.HelloResponse, stateModel);
                }
                catch (Exception e)
                {
                    logger.LogError(e, "Exception sending the hello response after an error.");
                }
            }, TaskContinuationOptions.OnlyOnFaulted);
        }
        catch (ReauthenticationNeededException)
        {
            try
            {
                await RespondAuthenticationNeeded(connectionId);
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
            logger.LogError(e, "Fatal exception processing the incoming chat hub message.");
            await RespondSafe(connectionId, ChatHubClientMethods.HelloResponse, await GetFatalErrorHelloResponse(), "fatal error");
            Context.Abort();
        }
    }

    private async Task<StateModel> GetFatalErrorHelloResponse()
    {
        IReadOnlyList<ChatModel> chats = [
            new(
                Guid.NewGuid(),
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
        ];

        return new(
            0,
            chats,
            await chatsRenderer.RenderChatsToHtmlAsync(chats));
    }

    private async Task RespondAuthenticationNeeded(string connectionId)
    {
        await RespondSafe(connectionId, ChatHubClientMethods.Authenticate);
    }

    private async Task RespondSafe(string connectionId, string method, object? arg1 = null, string? useCase = "default")
    {
        try
        {
            await hubContext.Clients.Client(connectionId).SendAsync(method, arg1);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Exception sending the {method} response, use case {useCase}.", method, useCase);
        }
    }
}