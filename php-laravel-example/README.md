# PHP Laravel Example

Laravel app with a tiny UI that echoes request details, headers, environment variables, and runtime info for Out Plane testing.

## Run with Docker (one liner)
> Requires internet on first build to download Laravel via Composer.
```bash
docker build -t php-laravel-example . && docker run --rm -p 8080:8080 php-laravel-example
```

Then open http://localhost:8080 to see the UI.

## What it returns
- Request info: method, path, host, protocol, IP, user agent.
- Headers (pretty JSON).
- Environment variables (pretty JSON).
- Runtime: PHP version, SAPI, app env/debug, request id, timestamp.
