# .NET 8 Minimal API Example

Minimal ASP.NET Core 8 API that returns request and environment info as JSON for Out Plane testing.

## Run locally
```bash
dotnet run
```

## Endpoints
- `GET /` → redirects to `/info`
- `GET /info` → request/env/runtime snapshot

## Build and run the container (one liner)
```bash
docker build -t dotnet-minimal-api-example . && docker run --rm -p 8080:8080 dotnet-minimal-api-example
```

Environment:
- `PORT` (default `8080`)
