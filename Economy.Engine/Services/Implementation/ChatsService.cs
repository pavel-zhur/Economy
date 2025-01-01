using Economy.AiInterface.Interfaces;
using Economy.AiInterface.Services;
using Economy.Common;
using Economy.Engine.Enums;
using Economy.Engine.Models;
using Microsoft.Extensions.Logging;

namespace Economy.Engine.Services.Implementation;

internal class ChatsService<TState, TChatInitializer>(
    ILogger<ChatsService<TState, TChatInitializer>> logger,
    ChatsServiceMemory chatsServiceMemory,
    TChatInitializer chatInitializer,
    AiCompletion aiCompletion,
    AiTranscription aiTranscription,
    IStateFactory<TState> stateFactory,
    AiProcessingLogger aiProcessingLogger) 
        : IChatsService
    where TState : class, IState, new()
    where TChatInitializer : IChatInitializer
{
    public async Task GotMessage(ChatsServiceContext context, Guid chatId, string messageId, string message)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(DateTime.UtcNow, MessageType.UserText, messageId, message, UserMessageStatus.Thinking, null);

        await AddUserMessage(context, chatId, messageModel, chatStatus =>
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

    public async Task GotAudio(ChatsServiceContext context, Guid chatId, string messageId, byte[] audioData)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(
            DateTime.UtcNow,
            MessageType.UserVoice,
            messageId,
            null,
            UserMessageStatus.Transcribing,
            null);

        await AddUserMessage(context, chatId, messageModel, chatStatus =>
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

    public async Task<StateModel> GetState(ChatsServiceContext context)
    {
        var userData = await stateFactory.GetUserData();
        var chats = userData.GetAllChatModels();

        chats = chats.Where(x => x.Status is not ChatStatus.Closed).ToList();

        return new(
            userData.State.LatestRevision,
            chats);
    }

    public async Task TryCancel(ChatsServiceContext context, Guid chatId, string messageId)
    {
        logger.LogInformation("Requesting cancellation for {chatId}.", chatId);
        await chatsServiceMemory.Cancellations[(context.UserId, chatId, messageId)].CancelAsync();
    }

    public async Task CloseChat(ChatsServiceContext context, Guid chatId)
    {
        var userData = await stateFactory.GetUserData();
        lock (chatsServiceMemory.Lock)
        {
            var chat = userData.GetChatOrDefault(chatId, out var chatIndex);
            if (chat == null)
            {
                return;
            }

            if (!chat.Messages.Any())
            {
                throw new("Unable to close a chat with no messages.");
            }

            userData.UpdateChat(chatIndex, chat => chat with
            {
                Status = ChatStatus.Closed,
            });
        }

        await SendUpdate(context);
    }

    public async Task OnFunctionInvokedAsync(ChatsServiceContext context, Guid chatId, FunctionInvocationLog log)
    {
        var userData = await stateFactory.GetUserData();
        var chat = userData.GetChat(chatId, out _);

        lock (userData.ChatsLock)
        {
            chat.Messages.Add(new(DateTime.UtcNow, MessageType.SystemText, null, log.ToString(), null, SystemMessageSeverity.Success));
        }

        await SendUpdate(context);
    }

    private async Task SendUpdate(ChatsServiceContext context)
    {
        try
        {
            await context.SendUpdate(await GetState(context));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to send an update to the user {UserId}", context.UserId);
        }
    }

    // reacts to cancellation, sends updates on any update
    private async Task Process(ChatsServiceContext context, Guid chatId, CancellationTokenSource cancellationTokenSource, byte[]? audioData = null)
    {
        var cancellationToken = cancellationTokenSource.Token;
        var chatIndex = -1;
        var userData = await stateFactory.GetUserData();

        try
        {
            var chat = userData.GetChat(chatId, out chatIndex);
            var lastMessageIndex = chat.Messages.Count - 1;

            try
            {
                if (new[]
                    {
                        chat.Messages[lastMessageIndex].Type == MessageType.UserVoice,
                        audioData != null
                    }.Distinct().Single())
                {
                    using var audioStream = new MemoryStream(audioData!);
                    var text = await aiTranscription.Transcribe(audioStream);

                    lock (userData.ChatsLock)
                    {
                        chat.Messages[lastMessageIndex] = chat.Messages[lastMessageIndex] with
                        {
                            Text = text,
                            Status = UserMessageStatus.Thinking,
                        };
                    }
                }

                await SendUpdate(context);

                cancellationToken.ThrowIfCancellationRequested();

                var chatHistory = userData.GetChatHistory(chatIndex);
                if (!chatHistory.Any())
                {
                    await chatInitializer.Init(chatHistory);
                }

                aiProcessingLogger.SetCurrentChatId((this, chatId, context));
                var response = await aiCompletion.Execute(chatHistory, chat.Messages[lastMessageIndex].Text!);
                aiProcessingLogger.SetCurrentChatId(null);

                lock (userData.ChatsLock)
                {
                    chat.Messages[lastMessageIndex] = chat.Messages[lastMessageIndex] with
                    {
                        Status = UserMessageStatus.Done,
                    };

                    chat.Messages.Add(new(DateTime.UtcNow, MessageType.AssistantText, null, response,
                        null, SystemMessageSeverity.Success));

                    userData.UpdateChat(chatIndex, chat => chat with { Status = ChatStatus.Success, });
                }

                await SendUpdate(context);

                if (cancellationToken.IsCancellationRequested)
                {
                    logger.LogInformation("The cancellation had been requested for {chatId}, but it was too late.", chatId);
                }
            }
            catch (Exception e) when (e is TaskCanceledException or OperationCanceledException)
            {
                logger.LogInformation("The cancellation is successful for {chatId}.", chatId);

                lock (userData.ChatsLock)
                {
                    chat = userData.UpdateChat(chatIndex, chat => chat with { Status = ChatStatus.Ready, });

                    chat.Messages[lastMessageIndex] = chat.Messages[lastMessageIndex] with
                    {
                        Status = UserMessageStatus.Canceled,
                    };
                }

                await SendUpdate(context);
            }
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to process the chat {ChatId}", chatId);

            if (chatIndex > -1)
            {
                lock (userData.ChatsLock)
                {
                    var chat = userData.UpdateChat(chatIndex, chat => chat with { Status = ChatStatus.Error, });

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
            aiProcessingLogger.SetCurrentChatId(null);
            cancellationTokenSource.Dispose();
        }
    }

    private async Task AddUserMessage(ChatsServiceContext context, Guid chatId, MessageModel messageModel, Action<ChatStatus> chatStatusValidation, (string messageId, CancellationTokenSource cancellationTokenSource)? cancellation)
    {
        var userData = await stateFactory.GetUserData();
        userData.GetChat(chatId, out var chatIndex, () => (new(chatId, [], ChatStatus.Ready), new()));

        lock (userData.ChatsLock)
        {
            userData.UpdateChat(chatIndex, chat =>
            {
                chatStatusValidation(chat.Status);

                chat.Messages.Add(messageModel);
                chat = chat with
                {
                    Status = ChatStatus.Processing,
                };

                if (cancellation != null)
                {
                    chatsServiceMemory.Cancellations[(context.UserId, chatId, cancellation.Value.messageId)] =
                        cancellation.Value.cancellationTokenSource;
                }

                return chat;
            });

            if (userData.GetAllChatModels().All(x => x.Messages.Any()))
            {
                var newChatId = Guid.NewGuid();
                userData.GetChat(newChatId, out _, () => (new(newChatId, [], ChatStatus.Ready), new()));
            }
        }
    }
}