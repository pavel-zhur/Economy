using System.Text.Json.Serialization.Metadata;
using System.Text.Json.Serialization;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;
using Economy.AiInterface.StateManagement;
using Economy.AiInterface.Scope;
using Economy.AiInterface.Transcription;

namespace Economy.AiInterface;

public static class ServiceCollectionExtensions
{
    internal static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        Converters =
        {
            new JsonStringEnumConverter(),
        },
        TypeInfoResolver = new DefaultJsonTypeInfoResolver(),
    };

    public static IServiceCollection AddAudioTranscriptionService(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o))
            .AddScoped<TranscriptionService>();
    }

    public static IServiceCollection AddFinancialKernel<TUserDataStorage>(this IServiceCollection services, IConfiguration configuration)
        where TUserDataStorage : class, IUserDataStorage
    {
        var tempOptions = configuration.GetSection(nameof(AiInterfaceOptions)).Get<AiInterfaceOptions>()!;

        services.AddOpenAIChatCompletion("gpt-4o-mini", tempOptions.ApiKey);
        services.AddScoped<FinancialPlugin>();
        services.Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o));
        services.AddScoped<KernelPluginCollection>(serviceProvider =>
            [
                KernelPluginFactory.CreateFromObject(serviceProvider.GetRequiredService<FinancialPlugin>(), JsonSerializerOptions)
            ]
        );

        services.AddSingleton<FactoriesMemory>();
        services.AddScoped<StateFactory>();
        services.AddScoped<TUserDataStorage>()
            .AddScoped<IUserDataStorage>(x => x.GetRequiredService<TUserDataStorage>());

        services.AddScoped(serviceProvider =>
        {
            var kernel = new Kernel(serviceProvider, serviceProvider.GetRequiredService<KernelPluginCollection>());
            kernel.AutoFunctionInvocationFilters.Add(new ChatDebuggingFilter());
            return kernel;
        });

        services.AddScoped<ChatsFactory>();

        return services;
    }
}