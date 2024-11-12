using Economy.Memory.Models.State;
using System.Diagnostics.CodeAnalysis;

namespace Economy.Memory.Containers.State;

public interface IHistory
{
    [return: NotNullIfNotNull(nameof(entityFullId))]
    string? GetReferenceTitle(int? entityFullId, EntityType entityType);
    
    (CurrencyCustomDisplayUnit? currencyCustomDisplayUnit, string abbreviation) GetCurrencyTitles(int currencyId);
    string GetDetails(EntityFullId entityFullId);
}