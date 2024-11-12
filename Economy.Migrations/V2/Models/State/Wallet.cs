using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Wallet)]
[method: JsonConstructor]
public record Wallet(int Id, string Name) : EntityBase(Id)
{
    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Wallet name must be not empty.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}";
}