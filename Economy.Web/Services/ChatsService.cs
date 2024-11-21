using Economy.Engine;
using Economy.Engine.Models;
using Economy.Implementation;
using Economy.Memory.Containers.State;
using Economy.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Economy.Web.Services;

public class ChatsService(ILogger<ChatsService> logger, IHubContext<ChatHub> hubContext)
{
    private readonly Dictionary<(string userId, Guid chatId, string messageId), CancellationTokenSource> _cancellations = new();
    private readonly object _lock = new();

    public async Task GotMessage(ChatsServiceContext<State, ChatInitializer> context, Guid chatId, string messageId, string message)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(DateTime.UtcNow, MessageType.UserText, messageId, message, UserMessageStatus.Thinking, null);

        AddUserMessage(context, chatId, messageModel, chatStatus =>
        {
            if (chatStatus is ChatStatus.FatalError or ChatStatus.Processing or ChatStatus.Closed)
            {
                throw new($"A message is not expected into the chat with the status {chatStatus}");
            }
        }, (messageId, cancellationTokenSource));

        await Task.WhenAll(
            SendUpdate(context),
            Process(context, chatId, cancellationTokenSource));
    }

    public async Task GotAudio(ChatsServiceContext<State, ChatInitializer> context, Guid chatId, string messageId, byte[] audioData)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(
            DateTime.UtcNow,
            MessageType.UserVoice,
            messageId,
            null,
            UserMessageStatus.Transcribing,
            null);

        AddUserMessage(context, chatId, messageModel, chatStatus =>
        {
            if (chatStatus is ChatStatus.FatalError or ChatStatus.Processing)
            {
                throw new($"A message is not expected into the chat with the status {chatStatus}");
            }
        }, (messageId, cancellationTokenSource));

        await Task.WhenAll(
            SendUpdate(context),
            Process(context, chatId, cancellationTokenSource, audioData));
    }

    public StateModel GetState(ChatsServiceContext<State, ChatInitializer> context)
    {
        var chats = context.UserData.GetAllChatModels();

        chats = chats.Where(x => x.Status is not ChatStatus.Closed).ToList();

        return new StateModel(
            context.UserData.State.Events.Count,
            chats);
    }

    public async Task TryCancel(ChatsServiceContext<State, ChatInitializer> context, Guid chatId, string messageId)
    {
        logger.LogInformation("Requesting cancellation for {chatId}.", chatId);
        await _cancellations[(context.UserId, chatId, messageId)].CancelAsync();
    }

    public async Task CloseChat(ChatsServiceContext<State, ChatInitializer> context, Guid chatId)
    {
        lock (_lock)
        {
            var chat = context.UserData.GetChatOrDefault(chatId, out var chatIndex);
            if (chat == null)
            {
                return;
            }

            if (!chat.Messages.Any())
            {
                throw new("Unable to close a chat with no messages.");
            }

            context.UserData.UpdateChat(chatIndex, chat => chat with
            {
                Status = ChatStatus.Closed,
            });
        }

        await SendUpdate(context);
    }

    public StateModel GetFatalErrorHelloResponse()
    {
        return new(
            0,
            [
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
            ]);
    }

    private async Task SendUpdate(ChatsServiceContext<State, ChatInitializer> context)
    {
        try
        {
            await context.SendUpdate(GetState(context));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to send an update to the user {UserId}", context.UserId);
        }
    }

    // reacts to cancellation, sends updates on any update
    private async Task Process(ChatsServiceContext<State, ChatInitializer> context, Guid chatId, CancellationTokenSource cancellationTokenSource, byte[]? audioData = null)
    {
        var cancellationToken = cancellationTokenSource.Token;
        int chatIndex = -1;

        try
        {
            var chat = context.UserData.GetChat(chatId, out chatIndex);

            if (new[]
                {
                    chat.Messages[^1].Type == MessageType.UserVoice,
                    audioData != null
                }.Distinct().Single())
            {
                using var audioStream = new MemoryStream(audioData!);
                var text = await context.AiTranscription.Transcribe(audioStream);

                lock (context.UserData.ChatsLock)
                {
                    chat.Messages[^1] = chat.Messages[^1] with
                    {
                        Text = text,
                        Status = UserMessageStatus.Thinking,
                    };
                }
            }

            await SendUpdate(context);

            cancellationToken.ThrowIfCancellationRequested();

            var chatHistory = context.UserData.GetChatHistory(chatIndex);
            if (!chatHistory.Any())
            {
                context.ChatInitializer.Init(chatHistory, context.UserData.State);
            }

            var response = await context.AiCompletion.Execute(chatHistory, chat.Messages[^1].Text!);

            lock (context.UserData.ChatsLock)
            {
                chat.Messages[^1] = chat.Messages[^1] with
                {
                    Status = UserMessageStatus.Done,
                };

                chat.Messages.Add(new(DateTime.UtcNow, MessageType.ServerText, null, response, 
                    null, SystemMessageSeverity.Success));

                context.UserData.UpdateChat(chatIndex, chat => chat with { Status = ChatStatus.Success, });
            }

            await SendUpdate(context);

            if (cancellationToken.IsCancellationRequested)
            {
                logger.LogInformation("The cancellation had been requested for {chatId}, but it was too late.", chatId);
            }
        }
        catch (TaskCanceledException)
        {
            logger.LogInformation("The cancellation is successful for {chatId}.", chatId);

            lock (context.UserData.ChatsLock)
            {
                var chat = context.UserData.UpdateChat(chatIndex, chat => chat with { Status = ChatStatus.Ready, });

                chat.Messages[^1] = chat.Messages[^1] with
                {
                    Status = UserMessageStatus.Canceled,
                };
            }

            await SendUpdate(context);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to process the chat {ChatId}", chatId);

            if (chatIndex > -1)
            {
                lock (context.UserData.ChatsLock)
                {
                    var chat = context.UserData.UpdateChat(chatIndex, chat => chat with { Status = ChatStatus.Error, });

                    chat.Messages[^1] = chat.Messages[^1] with
                    {
                        Status = UserMessageStatus.Failed,
                    };

                    chat.Messages.Add(new(
                        DateTime.UtcNow,
                        MessageType.SystemText, 
                        null, 
                        "An error occurred.", 
                        null, 
                        SystemMessageSeverity.Error));
                }
            }

            await SendUpdate(context);
        }
        finally
        {
            cancellationTokenSource.Dispose();
        }
    }

    private void AddUserMessage(ChatsServiceContext<State, ChatInitializer> context, Guid chatId, MessageModel messageModel, Action<ChatStatus> chatStatusValidation, (string messageId, CancellationTokenSource cancellationTokenSource)? cancellation)
    {
        context.UserData.GetChat(chatId, out var chatIndex, () => (new ChatModel(chatId, [], ChatStatus.Ready), new()));

        lock (context.UserData.ChatsLock)
        {
            context.UserData.UpdateChat(chatIndex, chat =>
            {
                chatStatusValidation(chat.Status);

                chat.Messages.Add(messageModel);
                chat = chat with
                {
                    Status = ChatStatus.Processing,
                };

                if (cancellation != null)
                {
                    _cancellations[(context.UserId, chatId, cancellation.Value.messageId)] =
                        cancellation.Value.cancellationTokenSource;
                }

                return chat;
            });

            if (context.UserData.GetAllChatModels().All(x => x.Messages.Any()))
            {
                var newChatId = Guid.NewGuid();
                context.UserData.GetChat(newChatId, out _, () => (new ChatModel(newChatId, [], ChatStatus.Ready), new()));
            }
        }
    }
}