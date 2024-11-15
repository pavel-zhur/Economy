using Microsoft.AspNetCore.SignalR;

namespace Economy.Web.Hubs;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendAudio(string user, byte[] audioData)
    {
        // Handle the audio data as needed
        await Clients.All.SendAsync("ReceiveAudio", user, "xxx");
    }
}
