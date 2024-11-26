using Economy.AiInterface.Services;
using Economy.Engine;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Sub;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Economy.Implementation;

public class ChatInitializer(AiCompletion aiCompletion)
{
    public void Init(ChatHistory chatHistory, State state)
    {
        aiCompletion.AddSystemMessage(chatHistory, @"

- When you call create_or_update_*, pass -1 id value if you intend to create a new entity.
- When you call create_or_update_*, pass all fields in case of update as well. The update will be a full replacement.
- When create_or_update_* is executed successfully, the user sees the new or updated entity right away. Do not repeat the entity in the response.
- For date_and_time fields, try to specify realistic the time as well, try to avoid 00:00:00.
- Avoid creating duplicates: when you've created a new entity and the user wants to update it, use the id from the creation response to update it. Every successful creation is committed to the state immediately.

");

        var now = DateTime.UtcNow;
        aiCompletion.AddSystemMessage(chatHistory, new
            {
                CurrentDate = new Date(now.Year, now.Month, now.Day),
                CurrentDateAndTime = now,
                Currencies = state.Repositories.Currencies.GetAll(),
                Wallets = state.Repositories.Wallets.GetAll(),
                ActivePlans = state.Repositories.Plans.GetAll(),
                Categories = state.Repositories.Categories.GetAll(),
            });
    }
}