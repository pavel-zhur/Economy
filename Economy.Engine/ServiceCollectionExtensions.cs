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
    public static IServiceCollection AddStateManagement<TUserDataStorage, TState, TChatInitializer>(this IServiceCollection services, IConfiguration configuration, IReadOnlyList<Type> pluginTypes)
        where TUserDataStorage : class, IUserDataStorage 
        where TState : class, IState
        where TChatInitializer : class, IChatInitializer =>
        services
            .AddCompletionKernel(configuration, pluginTypes)
            .AddScoped<AiProcessingLogger>()
            .AddScoped(serviceProvider => (IAiProcessingLogger)serviceProvider.GetRequiredService<AiProcessingLogger>())
            .AddScoped<TChatInitializer>()
            .AddScoped<IChatsService, ChatsService<TState, TChatInitializer>>()
            .AddSingleton<ChatsServiceMemory>()
            .AddSingleton<StateFactoryMemory<TState>>()
            .AddScoped<IStateFactory<TState>, StateFactory<TState>>()
            .AddScoped<TUserDataStorage>()
            .AddScoped<IUserDataStorage>(x => x.GetRequiredService<TUserDataStorage>());
}