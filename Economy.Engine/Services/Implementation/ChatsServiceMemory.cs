namespace Economy.Engine.Services.Implementation;

internal class ChatsServiceMemory
{
    public Dictionary<(string userId, Guid chatId, string messageId), CancellationTokenSource> Cancellations { get; } = new();

    public Lock Lock { get; } = new();
}