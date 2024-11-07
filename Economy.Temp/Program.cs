using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;
using Economy.Temp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

var builder = Host.CreateApplicationBuilder(args);

builder.Services
    .Configure<TempOptions>(o => builder.Configuration.GetSection(nameof(TempOptions)).Bind(o))
    .AddMemory();

using var host = builder.Build();

Program2._apiKey = Program3.ApiKey = host.Services.GetRequiredService<IOptions<TempOptions>>().Value.OpenAiKey;

//await Program3.Main2();

var state = host.Services.GetRequiredService<State>();

// Output the state events
foreach (var @event in state.Events)
{
    Console.WriteLine(@event);
}
