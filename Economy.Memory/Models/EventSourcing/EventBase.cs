using Economy.Memory.Tools;

namespace Economy.Memory.Models.EventSourcing;

public abstract record EventBase(DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision)
{
    public virtual Details ToDetails() => new(EventType)
    {
        ["CreatedOn"] = CreatedOn,
        [Details.RevisionProperty] = Revision,
    };

    public abstract EventType EventType { get; }
}