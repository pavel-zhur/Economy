using Economy.AiInterface;
using Economy.Web.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Localization;
using System.Globalization;
using System.Security.Claims;
using Economy.UserStorage;
using Economy.Web.Tools;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddRazorPages();

builder.Services
    .AddAudioTranscriptionService(builder.Configuration)
    .AddFinancialKernel<UserDataStorage>(builder.Configuration)
    .AddHttpContextAccessor()
    .AddUserStorage<GoogleAuthService>(builder.Configuration);

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

// Map the custom authentication endpoint for development
if (app.Environment.IsDevelopment())
{
    app.MapGet("/auth-dev/{userid}", async context =>
    {
        var userId = context.Request.RouteValues["userid"]?.ToString() ?? throw new InvalidOperationException("UserId is not provided.");
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
        context.Response.Redirect("/");
    });
}

app.Run();