using System.Text.Json.Serialization;
using Economy.Memory.Migrations.Ex;
using Economy.Memory.Migrations.V3.Sub;
using Economy.Memory.Models.State.Enums;

namespace Economy.Memory.Migrations.V3.Root;

[method: JsonConstructor]
internal record V3Transaction(
    int Id,
    string? SpecialNotes,
    int PlanId,
    TransactionType Type,
    V3TransactionPlannedAmount? Planned,
    V3TransactionActualAmount? Actual)
    : ExEntityBase(Id);