using System.Text.Json;
using System.Text;
using Economy.Common;
using Economy.Memory.Containers.State;
using Economy.Memory.Migrations.Serialization;

namespace Economy.Memory.Migrations.Services;

internal class Migrator : IMigrator<State>
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        Converters =
        {
            new EventBaseConverter(),
            new EntityBaseConverter(),
        },
        WriteIndented = true
    };

    public byte[] SaveToBinary(State state)
    {
        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new SerializedEvents(3, state.Events), JsonSerializerOptions));
    }

    public void LoadFromBinary(State state, byte[]? data)
    {
        var events = JsonSerializer.Deserialize<SerializedEvents>(data, JsonSerializerOptions)!;
        if (events.Version != 3)
        {
            throw new ArgumentOutOfRangeException(nameof(events.Version), events.Version, "Expected version 3");
        }

        foreach (var @event in events.Events)
        {
            state.Apply(@event);
        }
    }
}