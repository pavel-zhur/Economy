using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Category)]
[method: JsonConstructor]
public record Category(int Id, string Name, string? SpecialNotes) : EntityBase(Id)
{
    internal override void Validate(Repositories repositories)
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

    public override string ToDetails(IHistory repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $" n:({SpecialNotes})")}";
}