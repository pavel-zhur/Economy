﻿using System.Text.Json.Serialization;
using Economy.Memory.Models.State.Sub;

namespace Economy.Memory.Migrations.V3.Sub;

[method: JsonConstructor]
internal record V3TransactionActualAmount(
    DateTime DateAndTime,
    Amounts Amounts);