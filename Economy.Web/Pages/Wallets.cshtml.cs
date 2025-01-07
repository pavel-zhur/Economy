using Economy.Implementation.Factories;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.State.Root;
using Economy.Memory.Models.State.Sub;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class WalletsModel(IReadOnlyStateFactory<Repositories> stateFactory) : PageModel
{
    [FromQuery] public WalletsOrdering Ordering { get; set; } = WalletsOrdering.Name;

    public enum WalletsOrdering
    {
        Id,
        IdDesc,
        Name,
        Total,
        TotalDesc,
        LastAudit,
        LastAuditDesc,
    }

    public Amounts Total { get; set; } = null!;

    public IReadOnlyList<(Wallet wallet, WalletAudit? audit)> Wallets { get; set; } = null!;

    public async Task OnGet()
    {
        var repositories = await stateFactory.GetState();

        Wallets = repositories.Wallets.GetAll()
            .OrderBy(x => x.Id)
            .Select(w => (
                wallet: w,
                audit: repositories.WalletAudits.GetAll()
                    .Where(x => x.WalletId == w.Id)
                    .OrderByDescending(x => x.CheckDateAndTime)
                    .ThenByDescending(x => x.Id)
                    .FirstOrDefault()))
            .ToList();

        Total = new();
        foreach (var (_, audit) in Wallets.Where(x => x.audit != null))
        {
            Total.Add(audit!.Amounts);
        }
    }

    public async Task<IActionResult> OnGetReload()
    {
        await OnGet();
        return Partial("Dynamic/DynamicWallets", this);
    }
}