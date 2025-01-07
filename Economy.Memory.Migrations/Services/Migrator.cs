using System.Text.Json;
using System.Text;
using Economy.Common;
using Economy.Memory.Containers.State;
using Economy.Memory.Migrations.Serialization.Ex;
using Economy.Memory.Migrations.Serialization.Future;
using Economy.Memory.Migrations.Tools;
using System.Text.Json.Serialization;
using Economy.Memory.Models.Branching;

namespace Economy.Memory.Migrations.Services;

internal class Migrator : IMigrator<States>
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

    public byte[] SaveToBinary(States state)
    {
        var (events, branches) = state.Dump();
        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new FutureSerializedEvents(Constants.LatestVersion, events, branches), _futureJsonSerializerOptions));
    }

    public States LoadFromBinary(byte[]? data)
    {
        var exEvents = JsonSerializer.Deserialize<ExSerializedEvents>(data, (JsonSerializerOptions)new()
        {
            Converters =
            {
                new ExEventBaseConverter(),
                new JsonStringEnumConverter(),
            },
        })!;

        switch (exEvents.Version)
        {
            case Constants.LatestVersion:
                var currentData = JsonSerializer.Deserialize<FutureSerializedEvents>(data, _futureJsonSerializerOptions)!;
                return States.Load(currentData.Events, currentData.Branches);

            case 5:
                var v5Data = JsonSerializer.Deserialize<FutureSerializedEvents>(data, _futureJsonSerializerOptions)!;

                List<Branch> branches = [
                    new(0, "Root", BranchStatus.Committed, null),
                ];

                if (v5Data.Events.Any())
                {
                    branches.Add(new(1, null, BranchStatus.Committed, v5Data.Events[^1].Id));
                }

                return States.Load(v5Data.Events, branches);
            case 4:
                var v4Data = JsonSerializer.Deserialize<FutureSerializedEvents>(data, _futureJsonSerializerOptions)!;

                Guid? lastId = null;
                var events = v4Data.Events.Select((e, i) =>
                {
                    e = e with
                    {
                        ParentId = lastId,
                        Revision = i + 1,
                        Id = Guid.NewGuid(),
                    };

                    lastId = e.Id;

                    return e;
                }).ToList();

                branches = [
                    new(0, "Root", BranchStatus.Committed, null),
                ];

                if (events.Any())
                {
                    branches.Add(new(1, null, BranchStatus.Committed, lastId));
                }

                return States.Load(events, branches);

            default:
                throw new NotSupportedException($"Unsupported version: {exEvents.Version}");
        }
    }

    public States CreateEmpty()
    {
        return States.Load([], [new(0, null, BranchStatus.Committed, null)]);
    }
}