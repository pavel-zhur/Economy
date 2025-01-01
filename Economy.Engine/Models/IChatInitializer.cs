using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.Engine.Models;

public interface IChatInitializer
{
    Task Init(ChatHistory chatHistory);
}