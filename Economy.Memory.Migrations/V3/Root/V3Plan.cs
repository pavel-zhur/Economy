using System.Text.Json.Serialization;
using Economy.Memory.Migrations.Ex;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Migrations.V3.Root;

[ExEntityType(ExEntityType.V3Plan)]
[method: JsonConstructor]
internal record V3Plan(
    int Id,
    string Name,
    string? SpecialNotes,
    int? ParentPlanId,
    PlanSchedule? Schedule)
    : ExEntityBase(Id);