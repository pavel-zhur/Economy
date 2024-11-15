using Microsoft.AspNetCore.SignalR;

namespace Economy.Web.Hubs;

public class ChatHub(ILogger<ChatHub> logger) : Hub
{
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        logger.LogInformation($"User {Context.UserIdentifier} connected");
    }

    public async Task SendMessage(string user, string message)
    {
        if (user == "abort")
        {
            Context.Abort();
            return;
        }

        await Clients.All.SendAsync("ReceiveMessage", $"user {Context.UserIdentifier} {Context.User?.Identity?.Name}", message);
    }

    public async Task SendAudio(string user, byte[] audioData)
    {
        // Handle the audio data as needed
        await Clients.All.SendAsync("ReceiveAudio", user, "xxx");
    }
}
