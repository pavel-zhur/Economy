using Economy.AiInterface;
using Economy.AiInterface.Scope;
using Economy.Memory.Containers.State;
using Economy.Temp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services
    .AddFinancialKernel<UserGetter>(builder.Configuration)
    .AddScoped<ConsoleChat>();

using var host = builder.Build();

var scope = host.Services.CreateAsyncScope();
await scope.ServiceProvider.GetRequiredService<ConsoleChat>().Main2();

public class UserGetter : IStateUserGetter
{
    public string GetStateUserKey() => "console_user1";
}