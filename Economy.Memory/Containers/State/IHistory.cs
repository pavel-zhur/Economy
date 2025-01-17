using System.Diagnostics.CodeAnalysis;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Containers.State;

public interface IHistory
{
    [return: NotNullIfNotNull(nameof(entityId))]
    string? GetReferenceTitle(int? entityId, EntityType entityType);
    
    (CurrencyCustomDisplayUnit? currencyCustomDisplayUnit, string abbreviation) GetCurrencyTitles(int currencyId);
    string GetDetails(EntityFullId entityFullId);
}