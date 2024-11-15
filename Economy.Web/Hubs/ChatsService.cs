using Economy.AiInterface.Scope;
using Economy.Web.Hubs.Models;
using Microsoft.AspNetCore.SignalR;
using OneShelf.Common;

namespace Economy.Web.Hubs;

public class ChatsService(ILogger<ChatsService> logger, IHubContext<ChatHub> hubContext, FactoriesMemory factoriesMemory)
{
    private readonly Dictionary<string, List<ChatModel>> _chats = new();
    private readonly Dictionary<(string userId, string randomChatId, string randomMessageId), CancellationTokenSource> _cancellations = new();
    private readonly object _lock = new();

    public async Task GotMessage(IUserDataStorage userDataStorage, string userId, string randomChatId, string randomMessageId, string message)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(DateTime.UtcNow, MessageType.UserText, randomMessageId, message, null, UserMessageStatus.Thinking, null);

        AddUserMessage(userId, randomChatId, messageModel, chatStatus =>
        {
            if (chatStatus is ChatStatus.FatalError or ChatStatus.Processing)
            {
                throw new($"A message is not expected into the chat with the status {chatStatus}");
            }
        }, (randomMessageId, cancellationTokenSource));

        await Task.WhenAll(
            SendUpdate(userDataStorage, userId),
            Process(userDataStorage, userId, randomChatId, cancellationTokenSource));
    }

    public async Task GotAudio(IUserDataStorage userDataStorage, string userId, string randomChatId, string randomMessageId, byte[] audioData)
    {
        CancellationTokenSource cancellationTokenSource = new();
        var messageModel = new MessageModel(DateTime.UtcNow, MessageType.UserText, randomMessageId, null, audioData, UserMessageStatus.Thinking, null);

        AddUserMessage(userId, randomChatId, messageModel, chatStatus =>
        {
            if (chatStatus is ChatStatus.FatalError or ChatStatus.Processing)
            {
                throw new($"A message is not expected into the chat with the status {chatStatus}");
            }
        }, (randomMessageId, cancellationTokenSource));

        await Task.WhenAll(
            SendUpdate(userDataStorage, userId),
            Process(userDataStorage, userId, randomChatId, cancellationTokenSource));
    }

    public async Task<StateModel> GetState(IUserDataStorage userDataStorage, string userId)
    {
        var (state, _) = await factoriesMemory.GetOrCreate(userDataStorage);

        IReadOnlyList<ChatModel> chats;

        lock (_lock)
        {
            chats = _chats.TryGetValue(userId, out var userChats) ? userChats.ToList() : [];
        }

        return new StateModel(
            state.Events.Count,
            chats);
    }

    public async Task TryCancel(string userId, string randomChatId, string randomMessageId)
    {
        await _cancellations[(userId, randomChatId, randomMessageId)].CancelAsync();
    }

    public async Task CloseChat(IUserDataStorage userDataStorage, string userId, string randomChatId)
    {
        lock (_lock)
        {
            if (!_chats.TryGetValue(userId, out var userChats))
            {
                return;
            }

            var chat = userChats.WithIndices().AsNullable().SingleOrDefault(c => c!.Value.x.RandomChatId == randomChatId);
            if (!chat.HasValue)
            {
                return;
            }

            userChats[chat.Value.i] = chat.Value.x with
            {
                Status = ChatStatus.Closed,
            };
        }

        await SendUpdate(userDataStorage, userId);
    }

    private async Task SendUpdate(IUserDataStorage userDataStorage, string userId)
    {
        try
        {
            await hubContext.Clients.User(userId).SendAsync(ChatHubClientMethods.HelloResponse, await GetState(userDataStorage, userId));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to send an update to the user {UserId}", userId);
        }
    }

    // reacts to cancellation, sends updates on any update
    private async Task Process(IUserDataStorage userDataStorage, string userId, string randomChatId, CancellationTokenSource cancellationTokenSource)
    {
        var cancellationToken = cancellationTokenSource.Token;
        int chatIndex = -1;

        try
        {
            lock (_lock)
            {
                chatIndex = _chats[userId].WithIndices().Single(x => x.x.RandomChatId == randomChatId).i;
            }

            await Task.Delay(1000, cancellationToken);

            lock (_chats)
            {
                _chats[userId][chatIndex].Messages[^1] = _chats[userId][chatIndex].Messages[^1] with
                {
                    Status = UserMessageStatus.Applying,
                };
            }

            cancellationToken.ThrowIfCancellationRequested();
            await SendUpdate(userDataStorage, userId);

            await Task.Delay(1000, cancellationToken);

            lock (_chats)
            {
                _chats[userId][chatIndex].Messages[^1] = _chats[userId][chatIndex].Messages[^1] with
                {
                    Status = UserMessageStatus.Done,
                };

                _chats[userId][chatIndex].Messages.Add(new(DateTime.UtcNow, MessageType.ServerText, null, "Success.", null, null, SystemMessageSeverity.Success));

                _chats[userId][chatIndex] = _chats[userId][chatIndex] with
                {
                    Status = ChatStatus.Success,
                };
            }

            await SendUpdate(userDataStorage, userId);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to process the chat {RandomChatId}", randomChatId);

            if (chatIndex > -1)
            {
                lock (_chats)
                {
                    _chats[userId][chatIndex] = _chats[userId][chatIndex] with
                    {
                        Status = ChatStatus.Error,
                    };
                }
            }

            await SendUpdate(userDataStorage, userId);
        }
        finally
        {
            cancellationTokenSource.Dispose();
        }
    }

    private void AddUserMessage(string userId, string randomChatId, MessageModel messageModel, Action<ChatStatus> chatStatusValidation, (string randomMessageId, CancellationTokenSource cancellationTokenSource)? cancellation)
    {
        lock (_lock)
        {
            if (!_chats.TryGetValue(userId, out var userChats))
            {
                _chats[userId] = userChats = new List<ChatModel>();
            }

            var chat = userChats.SingleOrDefault(c => c.RandomChatId == randomChatId);
            if (chat == null)
            {
                chat = new ChatModel(randomChatId, [], ChatStatus.Processing);
                userChats.Add(chat);
            }
            else
            {
                chatStatusValidation(chat.Status);
            }

            chat.Messages.Add(messageModel);
            if (cancellation != null)
            {
                _cancellations[(userId, randomChatId, cancellation.Value.randomMessageId)] = cancellation.Value.cancellationTokenSource;
            }
        }
    }
}