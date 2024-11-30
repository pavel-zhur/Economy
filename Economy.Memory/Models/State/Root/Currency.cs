using System.Text.Json.Serialization;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Models.State.Root;

[EntityType(EntityType.Currency)]
[method: JsonConstructor]
public record Currency(int Id, string LongName, string Abbreviation, string CurrencySymbol, CurrencyCustomDisplayUnit? CustomDisplayUnit) : EntityBase(Id)
{
    internal override void Validate(Repositories repositories)
    {
        if (Abbreviation.Length != 3)
        {
            throw new ArgumentException("Currency abbreviation must be 3 characters long.");
        }

        if (CurrencySymbol == default)
        {
            throw new ArgumentException("Currency symbol must be provided.");
        }

        if (string.IsNullOrWhiteSpace(LongName))
        {
            throw new ArgumentException("Currency long name must be not empty.");
        }
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Abbreviation}]";

    public override string ToDetails(IHistory repositories)
        => $"{Id} {LongName} ({Abbreviation}, {CurrencySymbol}) {CustomDisplayUnit}";
}