using Economy.AiInterface;
using Economy.Common;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Economy.Engine;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddStateManagement<TUserDataStorage, TMemoryPlugin, TState>(this IServiceCollection services, IConfiguration configuration)
        where TUserDataStorage : class, IUserDataStorage 
        where TMemoryPlugin : class
        where TState : class, IState, new()
    {
        services.AddCompletionKernel<TMemoryPlugin>(configuration);

        services.AddSingleton<FactoriesMemory<TState>>();
        services.AddScoped<StateFactory<TState>>();
        services.AddScoped<TUserDataStorage>()
            .AddScoped<IUserDataStorage>(x => x.GetRequiredService<TUserDataStorage>());

        return services;
    }
}