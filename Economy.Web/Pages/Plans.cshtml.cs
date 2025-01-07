using Economy.Memory.Models.State.Root;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class PlansModel : PageModel
{
    [FromQuery] public PlansOrdering Ordering { get; set; } = PlansOrdering.Name;

    public enum PlansOrdering
    {
        Id,
        IdDesc,
        Name,
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("Dynamic/DynamicPlans", this);
    }

    public IComparable OrderingFunction(Plan plan) =>
        Ordering switch
        {
            PlansOrdering.Id => plan.Id,
            PlansOrdering.IdDesc => -plan.Id,
            PlansOrdering.Name => plan.Name.ToLowerInvariant().Trim(),
            _ => throw new ArgumentOutOfRangeException()
        };
}