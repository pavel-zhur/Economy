using System.Text.Json.Serialization;
using Economy.Memory.Migrations.Ex;
using Economy.Memory.Migrations.V3.Sub;

namespace Economy.Memory.Migrations.V3.Root;

[method: JsonConstructor]
internal record V3Plan(
    int Id,
    string Name,
    string? SpecialNotes,
    int? ParentPlanId,
    V3PlanSchedule? Schedule)
    : ExEntityBase(Id);