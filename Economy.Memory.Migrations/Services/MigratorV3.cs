using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using Economy.Memory.Containers.State;
using Economy.Memory.Migrations.EventSourcing;
using Economy.Memory.Migrations.Ex;
using Economy.Memory.Migrations.V3.Root;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Tools;

namespace Economy.Memory.Migrations.Services;

internal class MigratorV3
{
    public void Apply(State state, List<ExEventBase> events, JsonSerializerOptions futureJsonSerializerOptions)
    {
        var exJsonSerializerOptions = new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        };

        foreach (var @event in events)
        {
            switch (@event)
            {
                case ExCreation exCreation when Enum.TryParse<ExV3EntityType>(exCreation.Entity.Type, out var entityType) && entityType == ExV3EntityType.Transaction:
                    state.Apply(new Creation(Convert(state, 
                        JsonSerializer.Deserialize<V3Transaction>(exCreation.Entity.Data.ToJsonString(), exJsonSerializerOptions)!), 
                        exCreation.CreatedOn));
                    break;
                case ExUpdate exUpdate when Enum.TryParse<ExV3EntityType>(exUpdate.Entity.Type, out var entityType) && entityType == ExV3EntityType.Transaction:
                    state.Apply(new Update(Convert(state, 
                        JsonSerializer.Deserialize<V3Transaction>(exUpdate.Entity.Data.ToJsonString(), exJsonSerializerOptions)!),
                        exUpdate.CreatedOn));
                    break;
                case ExCreation exCreation:
                    state.Apply(JsonSerializer.Deserialize<Creation>(JsonSerializer.Serialize(exCreation), futureJsonSerializerOptions)!);
                    break;
                case ExUpdate exUpdate:
                    state.Apply(JsonSerializer.Deserialize<Update>(JsonSerializer.Serialize(exUpdate), futureJsonSerializerOptions)!);
                    break;
                case ExDeletion exDeletion:
                    state.Apply(JsonSerializer.Deserialize<Deletion>(JsonSerializer.Serialize(exDeletion), futureJsonSerializerOptions)!);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(@event));
            }
        }
    }

    private static Transaction Convert(State state, V3Transaction transaction) => new(
        transaction.Id, 
        transaction.PlanId,
        (transaction.Actual != null, transaction.Planned != null) switch
        {
            (true, false) => "[converted] actual only. ok.",
            (false, true) => "[converted] planned only. todo.",
            (true, true) => $"[converted] actual & planned. planned: {transaction.Planned!.Date} {transaction.Planned.Amounts.ToDetails(state.Repositories)}",
        },
        transaction.SpecialNotes,
        transaction.Type,
        transaction.Actual?.DateAndTime ?? transaction.Planned!.Date.ToDateTime(),
        transaction.Actual?.Amounts ?? transaction.Planned!.Amounts);
}