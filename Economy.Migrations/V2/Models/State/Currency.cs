using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Currency)]
[method: JsonConstructor]
public record Currency(int Id, string LongName, string Abbreviation, string CurrencySymbol, CurrencyCustomDisplayUnit? CustomDisplayUnit) : EntityBase(Id)
{
    public override void Validate(Repositories repositories)
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

    public override string ToDetails(Repositories repositories)
        => $"{Id} {LongName} ({Abbreviation}, {CurrencySymbol}) {CustomDisplayUnit}";
}