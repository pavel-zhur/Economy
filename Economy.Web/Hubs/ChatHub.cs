using Economy.Engine;
using Economy.Engine.Models;
using Economy.Implementation;
using Economy.Memory.Containers.State;
using Economy.UserStorage;
using Economy.Web.Services;
using Microsoft.AspNetCore.SignalR;

namespace Economy.Web.Hubs;

public class ChatHub(ILogger<ChatHub> logger, ChatsService chatsService, ChatsRenderer chatsRenderer, IHubContext<ChatHub> hubContext, StateFactory<State> stateFactory, IServiceScopeFactory serviceScopeFactory) : Hub
{
    public async Task SendMessage(Guid chatId, string messageId, string message)
    {
        await Task.Delay(1000);

        await ProcessSafe(Context.ConnectionId, async context =>
        {
            await chatsService.GotMessage(context, chatId, messageId, message);
        });
    }

    public async Task SendAudio(Guid chatId, string messageId, byte[] audioData)
    {
        await ProcessSafe(Context.ConnectionId, async context =>
        {
            await chatsService.GotAudio(context, chatId, messageId, audioData);
        });
    }

    public async Task Hello()
    {
        var connectionId = Context.ConnectionId;
        await ProcessSafe(connectionId, async context =>
        {
            var stateModel = chatsService.GetState(context);
            await RespondHello(connectionId, stateModel);
        });
    }

    public async Task TryCancel(Guid chatId, string messageId)
    {
        await ProcessSafe(Context.ConnectionId, async context =>
        {
            await chatsService.TryCancel(context, chatId, messageId);
        });
    }

    public async Task CloseChat(Guid chatId)
    {
        await ProcessSafe(Context.ConnectionId, async context =>
        {
            await chatsService.CloseChat(context, chatId);
        });
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        logger.LogInformation($"User {Context.UserIdentifier} connected");

        await ProcessSafe(Context.ConnectionId, _ => Task.CompletedTask);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        logger.LogInformation($"User {Context.UserIdentifier} disconnected");
    }

    private async void ProcessDetached(string connectionId, string userId, Func<ChatsServiceContext<State, ChatInitializer>, Task> action)
    {
        try
        {
            using var scope = serviceScopeFactory.CreateScope();
            var userData = await stateFactory.GetUserData();
            var scopeStateFactory = scope.ServiceProvider.GetRequiredService<StateFactory<State>>();
            scopeStateFactory.InitializeDetached(userData);
            var chatsServiceContext = new ChatsServiceContext<State, ChatInitializer>
            {
                ChatInitializer = scope.ServiceProvider.GetRequiredService<ChatInitializer>(),
                UserData = userData,
                UserId = userId,
                SendUpdate = async state => await RespondHello(hubContext.Clients.User(userId), state),
            };

            try
            {
                await action(chatsServiceContext);
            }
            catch (Exception e) when (e is not ReauthenticationNeededException)
            {
                logger.LogError(e, "Exception processing the incoming chat hub message.");

                try
                {
                    var stateModel = chatsService.GetState(chatsServiceContext);
                    await RespondHello(
                        connectionId, 
                        stateModel);
                }
                catch (Exception e2)
                {
                    logger.LogError(e2, "Exception sending the hello response after an error.");
                }
            }
        }
        catch (Exception e)
        {
            logger.LogError(e, "Global error in the detached scope.");
        }
    }

    private async Task ProcessSafe(string connectionId, Func<ChatsServiceContext<State, ChatInitializer>, Task> action)
    {
        try
        {
            if (Context.User?.Identity?.IsAuthenticated != true)
            {
                throw new ReauthenticationNeededException("Authentication check failed.");
            }

            var userId = Context.UserIdentifier ?? throw new ReauthenticationNeededException("Authentication check 2 failed.");
            
            ProcessDetached(connectionId, userId, action);
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
        }
        catch (Exception e)
        {
            logger.LogError(e, "Fatal exception processing the incoming chat hub message.");
            var fatalErrorHelloResponse = chatsService.GetFatalErrorHelloResponse();
            await RespondHello(
                connectionId, 
                fatalErrorHelloResponse,
                "fatal error");
        }
    }

    private async Task RespondAuthenticationNeeded(string connectionId)
    {
        await RespondSafe(connectionId, ChatHubClientMethods.Authenticate);
    }

    private async Task RespondHello(IClientProxy clientProxy, StateModel stateModel, string? useCase = "default")
    {
        try
        {
            await clientProxy.SendAsync(ChatHubClientMethods.HelloResponse, stateModel, await chatsRenderer.RenderChatsToHtmlAsync(stateModel.Chats));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Exception sending the {method} response, use case {useCase}.", ChatHubClientMethods.HelloResponse, useCase);
        }
    }

    private async Task RespondHello(string connectionId, StateModel stateModel, string? useCase = "default")
    {
        await RespondHello(hubContext.Clients.Client(connectionId), stateModel, useCase);
    }

    private async Task RespondSafe(string connectionId, string method, object? arg1 = null, object? arg2 = null, string? useCase = "default")
    {
        try
        {
            await hubContext.Clients.Client(connectionId).SendAsync(method, arg1, arg2);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Exception sending the {method} response, use case {useCase}.", method, useCase);
        }
    }
}