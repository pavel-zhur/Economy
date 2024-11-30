using Economy.Memory.Models.State.Enums;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Migrations.V3.Sub;

internal record V3PlanSchedule(
    Date StartDate, 
    Date FinishDate, 
    ScheduleInterval Schedule, 
    Amounts Amounts);