using Economy.AiInterface.Services;
using Economy.Engine.Services;
using Economy.Implementation.Factories;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Sub;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.Implementation;

internal class ChatInitializer(AiCompletion aiCompletion, IReadOnlyStateFactory<Repositories> stateFactory) : IChatInitializer
{
    public async Task Init(ChatHistory chatHistory)
    {
        aiCompletion.AddSystemMessage(chatHistory, @"

- When you call create_or_update_*, pass -1 value of the id field of the entity parameter if you intend to create a new entity.
- When you call create_or_update_*, pass all fields in case of update as well. The update will be a full replacement.
- When create_or_update_* is executed successfully, the user sees the new or updated entity right away. Do not repeat the entity in the response.
- For date_and_time fields, try to specify realistic the time as well, try to avoid 00:00:00.
- Avoid creating duplicates: when you've created a new entity and the user wants to update it, use the id from the creation response to update it. Every successful creation is committed to the state immediately.
- Use a ""plan"" for expected or planned expenses or incomes, also for groups of plans, recurring sets, budgets, or funds. Use a ""transaction"" for actual expenses or incomes that have already occurred. For future or desired financial activities, use a ""plan"" entity (defining an expected financial activity amount and planned date or planned recurring dates).

");

        var now = DateTime.UtcNow;

        var repositories = await stateFactory.GetState();

        aiCompletion.AddSystemMessage(chatHistory, new
            {
                CurrentDate = new Date(now.Year, now.Month, now.Day),
                CurrentDateAndTime = now,
                Currencies = repositories.Currencies.GetAll(),
                Wallets = repositories.Wallets.GetAll(),
                Categories = repositories.Categories.GetAll(),
            });
    }
}