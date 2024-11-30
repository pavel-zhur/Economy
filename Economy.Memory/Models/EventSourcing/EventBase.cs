using System.Globalization;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase(DateTime CreatedOn)
{
    private int _revision;

    public virtual string ToDetails(Containers.State.State state) => CreatedOn.ToString(CultureInfo.InvariantCulture);

    public int GetRevision() => _revision;

    public void SetRevision(int revision) => _revision = revision;
}