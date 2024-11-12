using System.Globalization;
using Economy.Memory.Containers.Repositories;

namespace Economy.Memory.Models.EventSourcing;

// todo: extract to files
public abstract record EventBase(DateTime CreatedOn)
{
    public virtual string ToDetails(Repositories repositories) => CreatedOn.ToString(CultureInfo.InvariantCulture);
}