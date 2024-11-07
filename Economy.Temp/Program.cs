using Economy.Temp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

var builder = Host.CreateApplicationBuilder(args);

builder.Services
    .Configure<TempOptions>(o => builder.Configuration.GetSection(nameof(TempOptions)).Bind(o));

using var host = builder.Build();

Program2._apiKey = Program3.ApiKey = host.Services.GetRequiredService<IOptions<TempOptions>>().Value.OpenAiKey;

await Program3.Main2();