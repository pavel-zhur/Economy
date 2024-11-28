using System.Text.Json;
using System.Text;
using Economy.Common;
using Economy.Memory.Containers.State;
using Economy.Memory.Migrations.Serialization.Ex;
using Economy.Memory.Migrations.Serialization.Future;
using Economy.Memory.Migrations.Tools;
using System.Text.Json.Serialization;

namespace Economy.Memory.Migrations.Services;

internal class Migrator(MigratorV3 migratorV3) : IMigrator<State>
{
    private readonly JsonSerializerOptions _futureJsonSerializerOptions = new()
    {
        Converters =
        {
            new FutureEventBaseConverter(),
            new FutureEntityBaseConverter(),
            new JsonStringEnumConverter(),
        },
        WriteIndented = true
    };

    public byte[] SaveToBinary(State state)
    {
        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new FutureSerializedEvents(Constants.LatestVersion, state.Events), _futureJsonSerializerOptions));
    }

    public void LoadFromBinary(State state, byte[]? data)
    {
        var events = JsonSerializer.Deserialize<ExSerializedEvents>(data, (JsonSerializerOptions)new()
        {
            Converters =
            {
                new ExEventBaseConverter(),
                new JsonStringEnumConverter(),
            },
        })!;

        switch (events.Version)
        {
            case Constants.LatestVersion:
                var currentEvents =
                    JsonSerializer.Deserialize<FutureSerializedEvents>(data, _futureJsonSerializerOptions)!;

                foreach (var @event in currentEvents.Events)
                {
                    state.Apply(@event);
                }

                return;
            case 3:
                migratorV3.Apply(state, events.Events, _futureJsonSerializerOptions);
                return;
            default:
                throw new NotSupportedException($"Unsupported version: {events.Version}");
        }
    }
}