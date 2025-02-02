﻿using System.Text.Json.Serialization.Metadata;
using System.Text.Json.Serialization;
using System.Text.Json;
using Economy.AiInterface.Filters;
using Economy.AiInterface.Interfaces;
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
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    public static IServiceCollection AddAudioTranscriptionService(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o))
            .AddScoped<AiTranscription>();
    }

    public static IServiceCollection AddCompletionKernel(this IServiceCollection services, IConfiguration configuration, IReadOnlyList<Type> pluginTypes)
    {
        var aiInterfaceOptions = configuration.GetSection(nameof(AiInterfaceOptions)).Get<AiInterfaceOptions>()!;

        services.AddOpenAIChatCompletion("gpt-4o-mini", aiInterfaceOptions.ApiKey);
        services.AddScoped<AiCompletion>();
        services.AddScoped<AutoFunctionInvocationFilter>();
        services.Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o));
        services.AddScoped<KernelPluginCollection>(serviceProvider => new(pluginTypes.Select(t =>
            KernelPluginFactory.CreateFromObject(serviceProvider.GetRequiredService(t), JsonSerializerOptions)))
        );

        services.AddScoped(serviceProvider =>
        {
            var kernel = new Kernel(serviceProvider, serviceProvider.GetRequiredService<KernelPluginCollection>());
            kernel.AutoFunctionInvocationFilters.Add(serviceProvider.GetRequiredService<AutoFunctionInvocationFilter>());
            return kernel;
        });

        return services;
    }
}