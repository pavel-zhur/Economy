using System.ClientModel;
using System.ClientModel.Primitives;
using System.Text;
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
    public static IServiceCollection AddAudioTranscriptionService(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o))
            .AddScoped<TranscriptionService>();
    }

    public static IServiceCollection AddFinancialKernel<TStateUserGetter>(this IServiceCollection services, IConfiguration configuration)
        where TStateUserGetter : class, IStateUserGetter
    {
        var tempOptions = configuration.GetSection(nameof(AiInterfaceOptions)).Get<AiInterfaceOptions>()!;

        services.AddOpenAIChatCompletion("gpt-4o-mini", tempOptions.ApiKey);
        services.AddScoped<FinancialPlugin>();
        services.Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o));
        services.AddScoped<KernelPluginCollection>(serviceProvider =>
            [
                KernelPluginFactory.CreateFromObject(serviceProvider.GetRequiredService<FinancialPlugin>(), new JsonSerializerOptions
                {
                    Converters =
                    {
                        new JsonStringEnumConverter(),
                    },
                    TypeInfoResolver = new DefaultJsonTypeInfoResolver(),
                })
            ]
        );

        services.AddSingleton<FactoriesMemory>();
        services.AddScoped<StateFactory>();
        services.AddScoped<IStateUserGetter, TStateUserGetter>();

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