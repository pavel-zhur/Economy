﻿using System.Text.Json;
using System.Text.Json.Serialization;
using Economy.Memory.Models.EventSourcing;

namespace Economy.Memory.Migrations.Serialization.Future;

internal class FutureEventBaseConverter : JsonConverter<EventBase>
{
    private const string TypePropertyName = "Type";
    private const string DataPropertyName = "Data";

    private static readonly Dictionary<string, Type> TypeMapping = new()
    {
        { nameof(Creation), typeof(Creation) },
        { nameof(Deletion), typeof(Deletion) },
        { nameof(Update), typeof(Update) }
        // Add other event types here
    };

    public override EventBase Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var doc = JsonDocument.ParseValue(ref reader);
        if (!doc.RootElement.TryGetProperty(TypePropertyName, out var typeElement))
        {
            throw new JsonException($"Missing property '{TypePropertyName}'");
        }

        var typeName = typeElement.GetString();
        if (typeName == null || !TypeMapping.TryGetValue(typeName, out var type))
        {
            throw new JsonException($"Unknown type '{typeName}'");
        }

        if (!doc.RootElement.TryGetProperty(DataPropertyName, out var dataElement))
        {
            throw new JsonException($"Missing property '{DataPropertyName}'");
        }

        return (EventBase)JsonSerializer.Deserialize(dataElement.GetRawText(), type, options)!;
    }

    public override void Write(Utf8JsonWriter writer, EventBase value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString(TypePropertyName, value.GetType().Name);
        writer.WritePropertyName(DataPropertyName);
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
        writer.WriteEndObject();
    }
}