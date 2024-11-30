using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class CategoriesModel : PageModel
{
    [FromQuery] public CategoriesOrdering Ordering { get; set; } = CategoriesOrdering.Name;

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("DynamicCategories", this);
    }

    public enum CategoriesOrdering
    {
        Id,
        IdDesc,
        Name,
    }
}