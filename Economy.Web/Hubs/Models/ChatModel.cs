namespace Economy.Web.Hubs.Models;

public record ChatModel(string RandomChatId, List<MessageModel> Messages, ChatStatus Status);