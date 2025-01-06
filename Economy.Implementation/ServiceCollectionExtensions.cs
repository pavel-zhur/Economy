using Economy.Common;
using Economy.Engine;
using Economy.Implementation.Factories;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Economy.Implementation;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddImplementation<TUserDataStorage>(this IServiceCollection services, IConfiguration configuration)
        where TUserDataStorage : class, IUserDataStorage
    {
        return services
            .AddScoped<FinancialPlugin>()
            .AddScoped<VersioningPlugin>()
            .AddStateManagement<TUserDataStorage, States, ChatInitializer>(configuration, [
                typeof(FinancialPlugin),
                typeof(VersioningPlugin)
            ])
            .AddScoped<IReadOnlyStateFactory<States>, ReadOnlyStateFactory>()
            .AddScoped<IReadOnlyStateFactory<State>, ReadOnlyStateFactory>()
            .AddScoped<IReadOnlyStateFactory<Repositories>, ReadOnlyStateFactory>();
    }
}