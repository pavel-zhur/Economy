using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Economy.Memory.Migrations.EventSourcing;

[method: JsonConstructor]
public record ExEntity(string Type, JsonObject Data);