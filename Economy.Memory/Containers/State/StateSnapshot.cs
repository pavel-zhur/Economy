using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Tools;
using OneShelf.Common;

namespace Economy.Memory.Containers.State;

internal readonly struct StateSnapshot(State state, int revision) : IHistory
{
    public int Revision => revision;

    public (CurrencyCustomDisplayUnit? currencyCustomDisplayUnit, string abbreviation) GetCurrencyTitles(int currencyId)
    {
        var revisionSnapshot = revision;
        return (state.GetEventsByEntityFullId(new(EntityType.Currency, currencyId))
                .TakeWhile(e => e.Revision < revisionSnapshot)
                .Last() switch
            {
                Creation creation => ((Currency)creation.Entity),
                Update update => ((Currency)update.Entity),
                _ => throw new ArgumentOutOfRangeException()
            }).SelectSingle(x => (x.CustomDisplayUnit, x.Abbreviation));
    }

    public Details GetDetails(EntityFullId entityFullId)
    {
        var revisionSnapshot = revision;
        return (state.GetEventsByEntityFullId(entityFullId)
                .TakeWhile(e => e.Revision < revisionSnapshot)
                .Last() switch
            {
                Creation creation => creation.Entity,
                Update update => update.Entity,
                _ => throw new ArgumentOutOfRangeException()
            }).ToDetails();
    }
}