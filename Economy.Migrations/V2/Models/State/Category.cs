using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Category)]
[method: JsonConstructor]
public record Category(int Id, string Name, string? SpecialNotes) : EntityBase(Id)
{
    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Category name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Category special notes must be null or not empty.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")}";
}