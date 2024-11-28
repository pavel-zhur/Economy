using System.Text.Json;
using System.Text.Json.Serialization;
using Economy.Memory.Migrations.EventSourcing;
using Economy.Memory.Models.EventSourcing;
namespace Economy.Memory.Migrations.Serialization.Ex;

internal class ExEventBaseConverter : JsonConverter<ExEventBase>
{
    private const string TypePropertyName = "Type";
    private const string DataPropertyName = "Data";

    private static readonly Dictionary<string, Type> TypeMapping = new()
    {
        { nameof(Creation), typeof(ExCreation) },
        { nameof(Deletion), typeof(ExDeletion) },
        { nameof(Update), typeof(ExUpdate) }
        // Add other event types here
    };

    public override ExEventBase Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using JsonDocument doc = JsonDocument.ParseValue(ref reader);
        if (!doc.RootElement.TryGetProperty(TypePropertyName, out JsonElement typeElement))
        {
            throw new JsonException($"Missing property '{TypePropertyName}'");
        }

        var typeName = typeElement.GetString();
        if (typeName == null || !TypeMapping.TryGetValue(typeName, out Type type))
        {
            throw new JsonException($"Unknown type '{typeName}'");
        }

        if (!doc.RootElement.TryGetProperty(DataPropertyName, out JsonElement dataElement))
        {
            throw new JsonException($"Missing property '{DataPropertyName}'");
        }

        return (ExEventBase)JsonSerializer.Deserialize(dataElement.GetRawText(), type, options)!;
    }

    public override void Write(Utf8JsonWriter writer, ExEventBase value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString(TypePropertyName, value.GetType().Name);
        writer.WritePropertyName(DataPropertyName);
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
        writer.WriteEndObject();
    }
}