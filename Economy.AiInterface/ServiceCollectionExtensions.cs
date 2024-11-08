using System.ClientModel;
using System.ClientModel.Primitives;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenAI;

namespace Economy.AiInterface;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAudioTranscriptionService(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .Configure<AiInterfaceOptions>(o => configuration.GetSection(nameof(AiInterfaceOptions)).Bind(o))
            .AddScoped<TranscriptionService>();
    }
}