using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Migrations.V3.Sub;

internal record V3PlanSchedule(
    [property:Obsolete] // todo: replace with Period
    Date StartDate, 
    Date FinishDate, 
    Schedule Schedule, 
    Amounts Amounts);