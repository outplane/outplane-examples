# Metabase Example

Metabase analytics UI running on port 8080 for Out Plane testing.

## Run with Docker
```bash
docker build -t metabase-example . && docker run --rm -p 8080:8080 metabase-example
```

Then open http://localhost:8080

Environment:
- `MB_JETTY_HOST` (default `0.0.0.0`)
- `MB_JETTY_PORT` (default `8080`)
