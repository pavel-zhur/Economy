using System.Text.Json;
using System.Text.Json.Serialization;
using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Root;

namespace Economy.Memory.Containers.State.Serialization;

internal class EntityBaseConverter : JsonConverter<EntityBase>
{
    private const string TypePropertyName = "Type";
    private const string DataPropertyName = "Data";

    private static readonly Dictionary<string, Type> TypeMapping = new()
    {
        { nameof(Currency), typeof(Currency) },
        { nameof(Wallet), typeof(Wallet) },
        { nameof(Event), typeof(Event) },
        { nameof(Category), typeof(Category) },
        { nameof(WalletAudit), typeof(WalletAudit) },
        { nameof(Plan), typeof(Plan) },
        { nameof(Transaction), typeof(Transaction) },
        { nameof(Conversion), typeof(Conversion) },
        { nameof(Transfer), typeof(Transfer) }
        // Add other entity types here
    };

    public override EntityBase Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
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

        return (EntityBase)JsonSerializer.Deserialize(dataElement.GetRawText(), type, options)!;
    }

    public override void Write(Utf8JsonWriter writer, EntityBase value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString(TypePropertyName, value.GetType().Name);
        writer.WritePropertyName(DataPropertyName);
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
        writer.WriteEndObject();
    }
}