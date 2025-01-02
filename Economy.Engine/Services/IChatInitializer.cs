using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.Engine.Services;

public interface IChatInitializer
{
    Task Init(ChatHistory chatHistory);
}