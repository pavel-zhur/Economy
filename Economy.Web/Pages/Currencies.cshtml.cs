using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class CurrenciesModel : PageModel
{
    [FromQuery] public CurrenciesOrdering Ordering { get; set; } = CurrenciesOrdering.Id;

    public enum CurrenciesOrdering
    {
        Id,
        IdDesc,
        LongName,
        Abbreviation,
    }

    public void OnGet()
    {
    }

    public IActionResult OnGetReload()
    {
        OnGet();
        return Partial("DynamicCurrencies", this);
    }
}