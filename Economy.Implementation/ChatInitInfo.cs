using Economy.Memory.Models.State.Root;
using Economy.Memory.Models.State.Sub;

namespace Economy.Implementation;

internal record ChatInitInfo(Date CurrentDate, DateTime CurrentDateAndTime, IReadOnlyList<Currency> Currencies, IReadOnlyList<Wallet> Wallets, IReadOnlyList<Category> Categories)
{
    public bool ShouldUpdate(ChatInitInfo another)
    {
        if (Currencies.Count != another.Currencies.Count || Wallets.Count != another.Wallets.Count || Categories.Count != another.Categories.Count)
        {
            return true;
        }

        if (Currencies.Zip(another.Currencies).Any(x => !ReferenceEquals(x.First, x.Second)))
        {
            return true;
        }

        if (Wallets.Zip(another.Wallets).Any(x => !ReferenceEquals(x.First, x.Second)))
        {
            return true;
        }

        if (Categories.Zip(another.Categories).Any(x => !ReferenceEquals(x.First, x.Second)))
        {
            return true;
        }

        return false;
    }
}