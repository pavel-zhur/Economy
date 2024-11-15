using Economy.AiInterface;
using Economy.Web.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Localization;
using System.Globalization;
using Economy.UserStorage;
using Economy.Web.Hubs;
using Economy.Web.Tools;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddRazorPages();

builder.Services
    .AddAudioTranscriptionService(builder.Configuration)
    .AddFinancialKernel<UserDataStorage>(builder.Configuration)
    .AddHttpContextAccessor()
    .AddUserStorage<GoogleAuthService>(builder.Configuration)
    .AddSingleton<ChatsService>();

builder.Services.AddControllers();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? throw new InvalidOperationException("Google ClientId is not configured.");
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? throw new InvalidOperationException("Google ClientSecret is not configured.");
    options.Scope.Add(GoogleStorage.Scope);
    options.SaveTokens = true;
    options.AccessType = "offline";
});

builder.Services
    .AddSignalR(o =>
    {
        o.MaximumReceiveMessageSize = 300_000_000;
    })
    .AddMessagePackProtocol();

var app = builder.Build();

var customCulture = new CultureInfo("en-US")
{
    DateTimeFormat = { ShortDatePattern = "dd.MM.yyyy", LongTimePattern = "HH:mm" },
    NumberFormat = { NumberDecimalSeparator = ".", NumberGroupSeparator = ",", NegativeSign = Constants.Minus }
};

var localizationOptions = new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture(customCulture),
    SupportedCultures = new List<CultureInfo> { customCulture },
    SupportedUICultures = new List<CultureInfo> { customCulture }
};

app.UseRequestLocalization(localizationOptions);

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ReauthenticationMiddleware>();

app.MapRazorPages();
app.MapControllers();

app.MapHub<ChatHub>("/chathub");

app.Run();