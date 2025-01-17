using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Tools;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Wallet)]
[method: JsonConstructor]
public record Wallet(int Id, string Name) : EntityBase(Id)
{
    internal override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Wallet name must be not empty.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override Details ToDetails()
        => new(GetEntityType())
        {
            ["Id"] = Id,
            ["Name"] = Name,
        };
}