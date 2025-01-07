using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.Implementation;

internal class ChatInitializerMemory
{
    public Dictionary<ChatHistory, ChatInitInfo> Memory { get; } = new();
}