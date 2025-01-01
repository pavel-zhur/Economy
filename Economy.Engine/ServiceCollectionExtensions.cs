using Economy.AiInterface;
using Economy.AiInterface.Interfaces;
using Economy.Common;
using Economy.Engine.Services;
using Economy.Engine.Services.Implementation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Economy.Engine;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddStateManagement<TUserDataStorage, TMemoryPlugin, TState, TChatInitializer>(this IServiceCollection services, IConfiguration configuration)
        where TUserDataStorage : class, IUserDataStorage 
        where TMemoryPlugin : class
        where TState : class, IState, new()
        where TChatInitializer : class, IChatInitializer =>
        services
            .AddCompletionKernel<TMemoryPlugin, AiProcessingLogger>(configuration)
            .AddScoped<TChatInitializer>()
            .AddScoped<IChatsService, ChatsService<TState, TChatInitializer>>()
            .AddSingleton<ChatsServiceMemory>()
            .AddSingleton<FactoriesMemory<TState>>()
            .AddScoped<IStateFactory<TState>, StateFactory<TState>>()
            .AddScoped<TUserDataStorage>()
            .AddScoped<IUserDataStorage>(x => x.GetRequiredService<TUserDataStorage>());
}