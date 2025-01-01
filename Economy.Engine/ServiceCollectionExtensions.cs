using Economy.AiInterface;
using Economy.AiInterface.Interfaces;
using Economy.Common;
using Economy.Engine.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Economy.Engine;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddStateManagement<TUserDataStorage, TMemoryPlugin, TState, TChatInitializer>(this IServiceCollection services, IConfiguration configuration)
        where TUserDataStorage : class, IUserDataStorage 
        where TMemoryPlugin : class
        where TState : class, IState, new()
        where TChatInitializer : class, IChatInitializer
    {
        services.AddCompletionKernel<TMemoryPlugin, AiProcessingLogger>(configuration);
        services.AddScoped<TChatInitializer>();
        services.AddSingleton<ChatsService<TState, TChatInitializer>>();
        services.AddSingleton<FactoriesMemory<TState>>();
        services.AddScoped<StateFactory<TState>>();
        services.AddScoped<TUserDataStorage>()
            .AddScoped<IUserDataStorage>(x => x.GetRequiredService<TUserDataStorage>());

        return services;
    }
}