using System.Text.Json;
using System.Text;
using Economy.Common;
using Economy.Memory.Containers.State;
using Economy.Memory.Migrations.EventSourcing;
using Economy.Memory.Migrations.Serialization.Ex;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Migrations.Serialization.Future;

namespace Economy.Memory.Migrations.Services;

internal class Migrator : IMigrator<State>
{
    public byte[] SaveToBinary(State state)
    {
        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new FutureSerializedEvents(3, state.Events), (JsonSerializerOptions)new()
        {
            Converters =
            {
                new FutureEventBaseConverter(),
                new FutureEntityBaseConverter(),
            },
            WriteIndented = true
        }));
    }

    public void LoadFromBinary(State state, byte[]? data)
    {
        var events = JsonSerializer.Deserialize<ExSerializedEvents>(data, (JsonSerializerOptions)new()
        {
            Converters =
            {
                new ExEventBaseConverter(),
                new ExEntityBaseConverter(),
            },
            WriteIndented = true
        })!;
        if (events.Version != 3)
        {
            throw new ArgumentOutOfRangeException(nameof(events.Version), events.Version, "Expected version 3");
        }

        foreach (var @event in events.Events)
        {
            state.Apply(@event switch
            {
                ExCreation exCreation => new Creation(exCreation.Entity, exCreation.CreatedOn),
                ExDeletion exDeletion => new Deletion(exDeletion.EntityFullId, exDeletion.CreatedOn),
                ExUpdate exUpdate => new Update(exUpdate.Entity, exUpdate.CreatedOn),
                _ => throw new ArgumentOutOfRangeException(nameof(@event))
            });
        }
    }
}