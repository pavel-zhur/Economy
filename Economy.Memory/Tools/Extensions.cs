using Economy.Memory.Models.State;

namespace Economy.Memory.Tools;

public static class Extensions
{
    public static Date ToDate(this DateTime dateTime) => new(dateTime.Year, dateTime.Month, dateTime.Day);

    public static DateTime ToDateTime(this Date date) => new(date.Year, date.Month, date.Day);

    public static EntityFullId ToEntityFullId(this int id, EntityType entityType) => new(entityType, id);
    
    public static EntityFullId? ToEntityFullId(this int? id, EntityType entityType) => id.HasValue ? new(entityType, id.Value) : null;
}