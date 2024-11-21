using System.Text.Json.Serialization.Metadata;
using System.Text.Json.Serialization;
using System.Text.Json;
using Economy.AiInterface.Filters;
using Economy.AiInterface.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;

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
            .AddScoped<AiTranscription>();
    }

    public static IServiceCollection AddCompletionKernel<TMemoryPlugin>(this IServiceCollection services, IConfiguration configuration)
        where TMemoryPlugin : class
    {
        var tempOptions = configuration.GetSection(nameof(AiInterfaceOptions)).Get<AiInterfaceOptions>()!;

        services.AddOpenAIChatCompletion("gpt-4o-mini", tempOptions.ApiKey);
        services.AddScoped<TMemoryPlugin>();
        services.AddScoped<AiCompletion>();
        services.Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o));
        services.AddScoped<KernelPluginCollection>(serviceProvider =>
            [
                KernelPluginFactory.CreateFromObject(serviceProvider.GetRequiredService<TMemoryPlugin>(), JsonSerializerOptions)
            ]
        );

        services.AddScoped(serviceProvider =>
        {
            var kernel = new Kernel(serviceProvider, serviceProvider.GetRequiredService<KernelPluginCollection>());
            kernel.AutoFunctionInvocationFilters.Add(new ChatDebuggingFilter());
            return kernel;
        });

        return services;
    }
}