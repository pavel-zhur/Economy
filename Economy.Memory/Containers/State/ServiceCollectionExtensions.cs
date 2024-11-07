using Microsoft.Extensions.DependencyInjection;

namespace Economy.Memory.Containers.State;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMemory(this IServiceCollection services)
    {
        services.AddSingleton<StateFactory>();
        services.AddSingleton(s => s.GetRequiredService<StateFactory>().CreateState());

        return services;
    }
}