using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;

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

    public override string ToDetails(IHistory repositories)
        => $"{Id} {Name}";
}