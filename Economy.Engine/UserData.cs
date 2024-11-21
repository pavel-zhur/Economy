using Economy.Engine.Models;
using Microsoft.SemanticKernel.ChatCompletion;
using OneShelf.Common;

namespace Economy.Engine;

public class UserData<TState>(TState state)
{
    private readonly List<(ChatModel chatModel, ChatHistory chatHistory)> _chats =
    [
        (new(Guid.NewGuid(), [], ChatStatus.Ready), new())
    ];

    public object ChatsLock { get; } = new();

    public TState State { get; } = state;

    public IReadOnlyList<ChatModel> GetAllChatModels()
    {
        lock (ChatsLock)
        {
            return _chats.Select(x => x.chatModel).ToList();
        }
    }

    public ChatModel? GetChatOrDefault(Guid chatId, out int chatIndex)
    {
        lock (ChatsLock)
        {
            var found = _chats.WithIndicesNullable().SingleOrDefault(x => x.x.chatModel.ChatId == chatId);
            chatIndex = found.i ?? -1;
            return found.x.chatModel;
        }
    }

    public ChatModel GetChat(Guid chatId, out int chatIndex)
        => GetChatOrDefault(chatId, out chatIndex) ?? throw new("The chat is required to exist.");

    public ChatModel GetChat(Guid chatId, out int chatIndex, Func<(ChatModel chatModel, ChatHistory chatHistory)> createMissing)
    {
        lock (ChatsLock)
        {
            var chat = GetChatOrDefault(chatId, out chatIndex);
            if (chat != null) return chat;

            var newChat = createMissing();
            if (newChat.chatModel.ChatId != chatId)
                throw new("The chat id must match the provided chat id.");

            chatIndex = _chats.Count;
            _chats.Add(newChat);
            return newChat.chatModel;
        }
    }

    public ChatModel UpdateChat(int chatIndex, Func<ChatModel, ChatModel> update)
    {
        lock (ChatsLock)
        {
            var oldChat = _chats[chatIndex].chatModel;
            var newChat = update(oldChat);

            if (oldChat.ChatId != newChat.ChatId)
                throw new("The chat id must not change.");

            _chats[chatIndex] = _chats[chatIndex] with
            {
                chatModel = newChat,
            };

            return newChat;
        }
    }
}
