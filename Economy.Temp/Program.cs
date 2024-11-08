using Economy.AiInterface;
using Economy.Memory.Containers.Repositories;
using Economy.Memory.Containers.State;
using Economy.Memory.Models.EventSourcing;
using Economy.Memory.Models.State;
using Economy.Temp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

var builder = Host.CreateApplicationBuilder(args);

builder.Services
    .AddFinancialKernel(builder.Configuration)
    .AddSingleton<ConsoleChat>();

using var host = builder.Build();
Program2._apiKey = Program3.ApiKey = host.Services.GetRequiredService<IOptions<AiInterfaceOptions>>().Value.ApiKey;

await host.Services.GetRequiredService<ConsoleChat>().Main2();
return;
var state = host.Services.GetRequiredService<State>();

// Output the state events
foreach (var @event in state.Events)
{
    Console.WriteLine(@event);
}