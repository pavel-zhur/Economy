using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.Engine.Services;

public interface IChatInitializer
{
    Task InitOrUpdate(ChatHistory chatHistory);
}