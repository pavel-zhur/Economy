using Economy.Memory.Containers.State;
using Economy.Web.Hubs;
using Economy.Web.Hubs.Models;
using Microsoft.AspNetCore.SignalR;
using OneShelf.Common;

namespace Economy.Web.Services;

public class ChatsService(ILogger<ChatsService> logger, IHubContext<ChatHub> hubContext, ChatsRenderer chatsRenderer)
{
    private readonly Dictionary<string, List<ChatModel>> _chats = new();
    private readonly Dictionary<(string userId, Guid chatId, string messageId), CancellationTokenSource> _cancellations = new();
    private readonly object _lock = new();

    public async Task GotMessage(State state, string userId, Guid chatId, string messageId, string message)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(DateTime.UtcNow, MessageType.UserText, messageId, message, UserMessageStatus.Thinking, null);

        AddUserMessage(userId, chatId, messageModel, chatStatus =>
        {
            if (chatStatus is ChatStatus.FatalError or ChatStatus.Processing or ChatStatus.Closed)
            {
                throw new($"A message is not expected into the chat with the status {chatStatus}");
            }
        }, (messageId, cancellationTokenSource));

        await Task.WhenAll(
            SendUpdate(state, userId),
            Process(state, userId, chatId, cancellationTokenSource));
    }

    public async Task GotAudio(State state, string userId, Guid chatId, string messageId, byte[] audioData)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(DateTime.UtcNow, MessageType.UserVoice, messageId, $"({audioData.Length / 1024:N1} KB)", UserMessageStatus.Thinking, null);

        AddUserMessage(userId, chatId, messageModel, chatStatus =>
        {
            if (chatStatus is ChatStatus.FatalError or ChatStatus.Processing)
            {
                throw new($"A message is not expected into the chat with the status {chatStatus}");
            }
        }, (messageId, cancellationTokenSource));

        await Task.WhenAll(
            SendUpdate(state, userId),
            Process(state, userId, chatId, cancellationTokenSource, audioData));
    }

    public async Task<StateModel> GetState(State state, string userId)
    {
        IReadOnlyList<ChatModel> chats;

        lock (_lock)
        {
            chats = _chats.TryGetValue(userId, out var userChats) ? userChats.ToList() : _chats[userId] = [new(Guid.NewGuid(), [], ChatStatus.Ready)];
        }

        chats = chats.Where(x => x.Status is not ChatStatus.Closed).ToList();

        return new StateModel(
            state.Events.Count,
            chats,
            await chatsRenderer.RenderChatsToHtmlAsync(chats));
    }

    public async Task TryCancel(string userId, Guid chatId, string messageId)
    {
        logger.LogInformation("Requesting cancellation for {chatId}.", chatId);
        await _cancellations[(userId, chatId, messageId)].CancelAsync();
    }

    public async Task CloseChat(State state, string userId, Guid chatId)
    {
        lock (_lock)
        {
            if (!_chats.TryGetValue(userId, out var userChats))
            {
                return;
            }

            var chat = userChats.WithIndices().AsNullable().SingleOrDefault(c => c!.Value.x.ChatId == chatId);
            if (!chat.HasValue)
            {
                return;
            }

            if (!chat.Value.x.Messages.Any())
            {
                throw new("Unable to close a chat with no messages.");
            }

            userChats[chat.Value.i] = chat.Value.x with
            {
                Status = ChatStatus.Closed,
            };
        }

        await SendUpdate(state, userId);
    }

    private async Task SendUpdate(State state, string userId)
    {
        try
        {
            await hubContext.Clients.User(userId).SendAsync(ChatHubClientMethods.HelloResponse, await GetState(state, userId));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to send an update to the user {UserId}", userId);
        }
    }

    // reacts to cancellation, sends updates on any update
    private async Task Process(State state, string userId, Guid chatId, CancellationTokenSource cancellationTokenSource, byte[]? audioData = null)
    {
        var cancellationToken = cancellationTokenSource.Token;
        int chatIndex = -1;

        try
        {
            lock (_lock)
            {
                chatIndex = _chats[userId].WithIndices().Single(x => x.x.ChatId == chatId).i;
            }

            await SendUpdate(state, userId);

            await Task.Delay(1000, cancellationToken);

            lock (_chats)
            {
                _chats[userId][chatIndex].Messages[^1] = _chats[userId][chatIndex].Messages[^1] with
                {
                    Status = UserMessageStatus.Applying,
                };
            }

            await SendUpdate(state, userId);

            await Task.Delay(1000, CancellationToken.None);

            lock (_chats)
            {
                if (_chats[userId][chatIndex].Messages[^1].Text == "error")
                    throw new("Test error requested.");

                _chats[userId][chatIndex].Messages[^1] = _chats[userId][chatIndex].Messages[^1] with
                {
                    Status = UserMessageStatus.Done,
                };

                _chats[userId][chatIndex].Messages.Add(new(DateTime.UtcNow, MessageType.ServerText, null, "Success.",
                    null, SystemMessageSeverity.Success));

                _chats[userId][chatIndex] = _chats[userId][chatIndex] with
                {
                    Status = ChatStatus.Success,
                };
            }

            await SendUpdate(state, userId);

            if (cancellationToken.IsCancellationRequested)
            {
                logger.LogInformation("The cancellation had been requested for {chatId}, but it was too late.", chatId);
            }
        }
        catch (TaskCanceledException)
        {
            logger.LogInformation("The cancellation is successful for {chatId}.", chatId);

            lock (_chats)
            {
                _chats[userId][chatIndex] = _chats[userId][chatIndex] with
                {
                    Status = ChatStatus.Ready,
                };

                _chats[userId][chatIndex].Messages[^1] = _chats[userId][chatIndex].Messages[^1] with
                {
                    Status = UserMessageStatus.Canceled,
                };
            }

            await SendUpdate(state, userId);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to process the chat {ChatId}", chatId);

            if (chatIndex > -1)
            {
                lock (_chats)
                {
                    _chats[userId][chatIndex] = _chats[userId][chatIndex] with
                    {
                        Status = ChatStatus.Error,
                    };

                    _chats[userId][chatIndex].Messages[^1] = _chats[userId][chatIndex].Messages[^1] with
                    {
                        Status = UserMessageStatus.Failed,
                    };

                    _chats[userId][chatIndex].Messages.Add(new(DateTime.UtcNow, MessageType.SystemText, null, "An error occurred.", null, SystemMessageSeverity.Error));
                }
            }

            await SendUpdate(state, userId);
        }
        finally
        {
            cancellationTokenSource.Dispose();
        }
    }

    private void AddUserMessage(string userId, Guid chatId, MessageModel messageModel, Action<ChatStatus> chatStatusValidation, (string messageId, CancellationTokenSource cancellationTokenSource)? cancellation)
    {
        lock (_lock)
        {
            if (!_chats.TryGetValue(userId, out var userChats))
            {
                _chats[userId] = userChats = new List<ChatModel>();
            }

            var chat = userChats.SingleOrDefault(c => c.ChatId == chatId);
            if (chat == null)
            {
                chat = new ChatModel(chatId, [], ChatStatus.Ready);
                userChats.Add(chat);
            }
            else
            {
                chatStatusValidation(chat.Status);
            }

            chat.Messages.Add(messageModel);
            _chats[userId][_chats[userId].IndexOf(chat)] = chat with
            {
                Status = ChatStatus.Processing,
            };

            if (cancellation != null)
            {
                _cancellations[(userId, chatId, cancellation.Value.messageId)] = cancellation.Value.cancellationTokenSource;
            }

            if (userChats.All(x => x.Status != ChatStatus.Ready))
            {
                userChats.Add(new(Guid.NewGuid(), [], ChatStatus.Ready));
            }
        }
    }
}