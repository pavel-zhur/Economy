using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Tools;

namespace Economy.Memory.Containers.State;

public interface IHistory
{
    (CurrencyCustomDisplayUnit? currencyCustomDisplayUnit, string abbreviation) GetCurrencyTitles(int currencyId);
    
    Details GetDetails(EntityFullId entityFullId);

    int Revision { get; }
}