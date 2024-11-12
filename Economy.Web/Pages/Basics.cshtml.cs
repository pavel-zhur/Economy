using Economy.AiInterface.Scope;
using Economy.Memory.Models.State;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class BasicsModel(StateFactory stateFactory) : PageModel
{
    public Amounts Total { get; set; } = null!;

    public IReadOnlyList<(Wallet wallet, WalletAudit? audit)> Wallets { get; set; } = null!;

    public async Task OnGet()
    {
        var state = await stateFactory.Get();

        Wallets = state.Repositories.Wallets.GetAll()
            .OrderBy(x => x.Id)
            .Select(w => (
                wallet: w,
                audit: state.Repositories.WalletAudits.GetAll()
                    .Where(x => x.WalletId == w.Id)
                    .OrderByDescending(x => x.CheckDateAndTime)
                    .ThenByDescending(x => x.Id)
                    .FirstOrDefault()))
            .ToList();

        Total = new Amounts();
        foreach (var (_, audit) in Wallets.Where(x => x.audit != null))
        {
            Total.Add(audit!.Amounts);
        }
    }
}