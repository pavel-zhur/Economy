using System.Globalization;
using Economy.Migrations.V2.Containers.Repositories;

namespace Economy.Migrations.V2.Models.EventSourcing;

// todo: extract to files
public abstract record EventBase(DateTime CreatedOn)
{
    public virtual string ToDetails(Repositories repositories) => CreatedOn.ToString(CultureInfo.InvariantCulture);
}