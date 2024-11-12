using System.Text.Json.Serialization;
using Economy.Migrations.V2.Containers.Repositories;
using Economy.Migrations.V2.Tools;

namespace Economy.Migrations.V2.Models.State;

[EntityType(EntityType.Plan)]
[method: JsonConstructor]
public record Plan(
    int Id,
    string Name,
    string? SpecialNotes,
    int? ParentPlanId,
    Date? StartDate,
    Date? FinishDate,
    Schedule? Schedule,
    PlanVolume? Volume)
    : EntityBase(Id)
{
    protected override IEnumerable<EntityFullId?> GetForeignKeysDirty() => (Volume?.Amounts.GetForeignKeysDirty() ?? Enumerable.Empty<EntityFullId?>()).Append(ParentPlanId.ToEntityFullId(EntityType.Plan));

    public override void Validate(Repositories repositories)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            throw new ArgumentException("Plan name must be not empty.");
        }

        if (SpecialNotes != null && string.IsNullOrWhiteSpace(SpecialNotes))
        {
            throw new ArgumentException("Plan special notes must be null or not empty.");
        }

        StartDate?.Validate();
        FinishDate?.Validate();

        if (StartDate > FinishDate)
        {
            throw new ArgumentException("Plan start date must be before finish date.");
        }

        if (Schedule.HasValue && ParentPlanId != null &&
            repositories.Plans.GetParents(this).Any(x => x.Schedule.HasValue))
        {
            throw new ArgumentException("A plan with a schedule may not have parents with schedules.");
        }

        Volume?.Validate();
    }

    public override string ToReferenceTitle()
        => $"[{Id} {Name}]";

    public override string ToDetails(Repositories repositories)
        => $"{Id} {Name}{(SpecialNotes == null ? null : $"n:({SpecialNotes})")} p:{repositories.GetReferenceTitle(ParentPlanId, EntityType.Plan)} [{StartDate} - {FinishDate}] {Volume?.Amounts.ToDetails(repositories)} {Schedule}";
}