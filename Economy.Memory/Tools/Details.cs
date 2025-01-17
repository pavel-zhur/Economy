using System.Text;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Base;
using OneShelf.Common;

namespace Economy.Memory.Tools;

public class Details
{
    public const string EntityType = "EntityType";
    public const string Id = nameof(EntityBase.Id);
    public const string CurrencyAmount = "CurrencyAmount";

    private readonly OrderedDictionary<string, object> _values = new();

    public Details(EntityType? entityType = null)
    {
        if (entityType != null)
        {
            _values.Add(EntityType, entityType);
        }
    }

    public int? this[EntityType entityType, string? title = null]
    {
        set
        {
            if (value != null) 
                _values.Add(title ?? entityType.ToString(), new EntityFullId(entityType, value.Value));
        }
    }

    public object? this[string key]
    {
        set
        {
            if (value != null)
            {
                _values.Add(key, value);
            }
        }
    }

    public string ToString(IHistory history)
    {
        var sb = new StringBuilder();
        foreach (var ((key, value), isLast) in _values.WithIsLast())
        {
            if (value is EntityFullId entityFullId)
            {
                sb.Append($"{key}: {history.GetReferenceTitle(entityFullId.Id, entityFullId.Type)}");
            }
            else if (value is Details child)
            {
                sb.Append($"{key}: {child.ToString(history)}");
            }
            else if (key == CurrencyAmount)
            {
                if (value is decimal amount)
                {
                    sb.Append($"{key}: {amount:0.00}");
                }
                else if (value is List<Details> amounts)
                {
                    sb.Append($"{key}: [");
                    foreach (var (amountDetails, isLastAmount) in amounts.WithIsLast())
                    {
                        sb.Append($"{amountDetails._values["Currency"]}: {amountDetails._values[CurrencyAmount]:0.00}");
                        if (!isLastAmount)
                        {
                            sb.Append(", ");
                        }
                    }

                    sb.Append("]");
                }
                else
                {
                    throw new InvalidOperationException("CurrencyAmount value must be decimal or list of details.");
                }
            }
            else
            {
                sb.Append($"{key}: {value}");
            }

            if (!isLast)
            {
                sb.Append(", ");
            }
        }

        return sb.ToString();
    }
}