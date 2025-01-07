using Economy.AiInterface.Services;
using Economy.Engine.Services;
using Economy.Implementation.Factories;
using Economy.Memory.Containers.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.Implementation;

internal class ChatInitializer(AiCompletion aiCompletion, IReadOnlyStateFactory<Repositories> stateFactory, ChatInitializerMemory memory, ILogger<ChatInitializer> logger) : IChatInitializer
{
    public async Task InitOrUpdate(ChatHistory chatHistory)
    {
        var now = DateTime.UtcNow;

        var repositories = await stateFactory.GetState();

        var chatInitInfo = new ChatInitInfo(new(now.Year, now.Month, now.Day), now, repositories.Currencies.GetAll().ToList(), repositories.Wallets.GetAll().ToList(), repositories.Categories.GetAll().ToList());

        if (!chatHistory.Any())
        {
            aiCompletion.AddSystemMessage(chatHistory, @"

- When you call create_or_update_*, pass -1 value of the id field of the entity parameter if you intend to create a new entity.
- When you call create_or_update_*, pass all fields in case of update as well. The update will be a full replacement.
- When create_or_update_* is executed successfully, the user sees the new or updated entity right away. Do not repeat the entity in the response.
- For date_and_time fields, try to specify realistic the time as well, try to avoid 00:00:00.
- Avoid creating duplicates: when you've created a new entity and the user wants to update it, use the id from the creation response to update it. Every successful creation is committed to the state immediately.
- Use a ""plan"" for expected or planned expenses or incomes, also for groups of plans, recurring sets, budgets, or funds. Use a ""transaction"" for actual expenses or incomes that have already occurred. For future or desired financial activities, use a ""plan"" entity (defining an expected financial activity amount and planned date or planned recurring dates).

");
            aiCompletion.AddSystemMessage(chatHistory, chatInitInfo);

            memory.Memory[chatHistory] = chatInitInfo;
        }
        else if (memory.Memory[chatHistory].ShouldUpdate(chatInitInfo))
        {
            aiCompletion.AddSystemMessage(chatHistory, chatInitInfo);

            memory.Memory[chatHistory] = chatInitInfo;

            logger.LogInformation("Updated.");
        }
    }
}