namespace Economy.Web.Hubs.Models;

public record StateModel(int LatestRevision, IReadOnlyList<ChatModel> Chats);