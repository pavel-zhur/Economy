using System.Globalization;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase(DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision)
{
    public virtual string ToDetails(Containers.State.State state) => CreatedOn.ToString(CultureInfo.InvariantCulture);
}