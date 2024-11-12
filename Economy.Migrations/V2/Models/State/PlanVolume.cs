using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.State;

public record PlanVolume(TransactionType Type, Amounts Amounts)
{
    public void Validate()
    {
        Amounts.Validate(false, false, true);
    }

    public string ToDetails(Repositories repositories)
        => $"{Type} {Amounts.ToDetails(repositories)}";
}