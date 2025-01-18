using System.Text;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State.Base;
using Economy.Memory.Models.State.Enums;
using OneShelf.Common;

namespace Economy.Memory.Tools;

public class Details
{
    public const string EntityTypeProperty = "EntityType";
    public const string IdProperty = nameof(EntityBase.Id);
    public const string CurrencyAmountProperty = "CurrencyAmount";
    public const string RevisionProperty = "Revision";
    public const string EventTypeProperty = "EventType";

    private readonly OrderedDictionary<string, object> _values = new();
    private readonly string? _referenceTitlePropertyName;

    public Details(EventType eventType)
    {
        _values.Add(EventTypeProperty, eventType);
    }

    public Details(EntityType entityType, string? referenceTitlePropertyName = null)
    {
        _values.Add(EntityTypeProperty, entityType);
        _referenceTitlePropertyName = referenceTitlePropertyName;
    }

    public Details()
    {
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

    public string ToReferenceTitle()
    {
        var entityType = (EntityType)_values[EntityTypeProperty];
        var id = (int)_values[IdProperty];
        
        if (_referenceTitlePropertyName != null)
        {
            var name = _values[_referenceTitlePropertyName];
            return $"[{entityType} {id}. {name}]";
        }

        return $"[{entityType} {id}]";
    }

    public string ToString(IHistory history, params string[] except)
    {
        if (_values.TryGetValue(RevisionProperty, out var revision) && revision as int? != history.Revision)
        {
            throw new("You need a different ToString method for this history revision.");
        }

        var sb = new StringBuilder();
        foreach (var ((key, value), isLast) in _values.Where(x => !except.Any() || !except.Contains(x.Key)).WithIsLast())
        {
            if (value is EntityFullId entityFullId)
            {
                sb.Append($"{key}: {history.GetDetails(entityFullId).ToReferenceTitle()}");
            }
            else if (value is Details child)
            {
                sb.Append($"{key}: {child.ToString(history)}");
            }
            else if (key == CurrencyAmountProperty)
            {
                if (value is decimal amount)
                {
                    var (currencyCustomDisplayUnit, abbreviation) = history.GetCurrencyTitles(((EntityFullId)_values[EntityType.Currency.ToString()]).Id);
                    string? prefix = null;
                    switch (currencyCustomDisplayUnit)
                    {
                        case CurrencyCustomDisplayUnit.Thousands:
                            amount /= 1000;
                            prefix = "k";
                            break;
                        case CurrencyCustomDisplayUnit.Millions:
                            amount /= 1_000_000;
                            prefix = "m";
                            break;
                    }

                    sb.Append($"{amount} {prefix}{abbreviation}");
                }
                else if (value is List<Details> amounts)
                {
                    sb.Append($"{key}: [");
                    foreach (var (amountDetails, isLastAmount) in amounts.WithIsLast())
                    {
                        sb.Append($"{amountDetails.ToString(history)}");
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

    public string ToString(State state)
    {
        if (!_values.TryGetValue(RevisionProperty, out var revision) || revision as int? == state.Events.Count)
        {
            return ToString(state.Repositories);
        }

        return ToString(state.CreateHistorySnapshot((int)revision));
    }
}