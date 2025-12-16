using System.Collections;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

var port = GetPort();
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(port);
});

var app = builder.Build();

app.MapGet("/", () => Results.Redirect("/info", permanent: false));

app.MapGet("/info", (HttpContext context) =>
{
    var request = context.Request;

    var headers = new SortedDictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    foreach (var header in request.Headers)
    {
        headers[header.Key] = string.Join(", ", header.Value);
    }

    var env = new SortedDictionary<string, string?>(StringComparer.Ordinal);
    foreach (DictionaryEntry entry in Environment.GetEnvironmentVariables())
    {
        env[entry.Key.ToString() ?? ""] = entry.Value?.ToString();
    }

    var runtime = new Dictionary<string, string>
    {
        ["dotnetVersion"] = RuntimeInformation.FrameworkDescription,
        ["processArchitecture"] = RuntimeInformation.ProcessArchitecture.ToString(),
        ["osDescription"] = RuntimeInformation.OSDescription,
        ["pid"] = Environment.ProcessId.ToString(),
        ["uptimeSeconds"] = GetUptimeSeconds().ToString("F3")
    };

    var response = new
    {
        message = "ASP.NET Core minimal API example reporting environment variables and user agent on Out Plane",
        requestId = Guid.NewGuid().ToString(),
        timestamp = DateTimeOffset.UtcNow.ToString("o"),
        method = request.Method,
        path = request.Path.ToString(),
        ip = context.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
        host = request.Headers.Host.ToString(),
        protocol = request.Scheme,
        userAgent = request.Headers.UserAgent.ToString(),
        headers,
        env,
        runtime
    };

    return Results.Json(response);
});

app.Run();

static int GetPort()
{
    var portValue = Environment.GetEnvironmentVariable("PORT");
    if (int.TryParse(portValue, out var parsed) && parsed > 0)
    {
        return parsed;
    }
    return 8080;
}

static double GetUptimeSeconds()
{
    return (DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalSeconds;
}
