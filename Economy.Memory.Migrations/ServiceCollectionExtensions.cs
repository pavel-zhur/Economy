using Economy.Common;
using Economy.Memory.Containers.State;
using Economy.Memory.Migrations.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Economy.Memory.Migrations;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMigrator(this IServiceCollection services)
    {
        return services
            .AddSingleton<IMigrator<States>, Migrator>();
    }
}