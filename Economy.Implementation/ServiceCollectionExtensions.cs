using Economy.Common;
using Economy.Engine;
using Economy.Memory.Containers.State;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Economy.Implementation;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddImplementation<TUserDataStorage, TMemoryPlugin>(this IServiceCollection services, IConfiguration configuration)
        where TUserDataStorage : class, IUserDataStorage 
        where TMemoryPlugin : class
    {
        return services
            .AddStateManagement<TUserDataStorage, TMemoryPlugin, State, ChatInitializer>(configuration);
    }
}