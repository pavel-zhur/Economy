﻿using Economy.Memory.Migrations.EventSourcing;

namespace Economy.Memory.Migrations.Serialization.Ex;

internal record ExSerializedEvents(int Version, List<ExEventBase> Events);