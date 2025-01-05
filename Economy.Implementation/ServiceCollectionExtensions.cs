using Economy.Common;
using Economy.Engine;
using Economy.Engine.Services;
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
            .AddStateManagement<TUserDataStorage, FinancialPlugin, States, ChatInitializer>(configuration)
            .AddScoped<IReadOnlyStateFactory<State>, ReadOnlyStateFactory>()
            .AddScoped<IReadOnlyStateFactory<Repositories>, ReadOnlyStateFactory>();
    }
}