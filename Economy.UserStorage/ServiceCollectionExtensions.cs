using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Economy.UserStorage;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddUserStorage<TGoogleAuthService>(this IServiceCollection services, IConfiguration configuration)
        where TGoogleAuthService : class, IGoogleAuthService
    {
        services
            .AddScoped<IGoogleAuthService, TGoogleAuthService>()
            .AddScoped<GoogleStorage>()
            .Configure<GoogleStorageOptions>(o => configuration.GetSection(nameof(GoogleStorageOptions)).Bind(o));
        return services;
    }
}