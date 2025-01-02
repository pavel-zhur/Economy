namespace Economy.Memory.Migrations.EventSourcing;

public abstract record ExEventBase(DateTime CreatedOn, Guid Id, Guid? ParentId, int Revision);