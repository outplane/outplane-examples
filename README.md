# Out Plane Examples

Collection of small apps to test and demo deployments on Out Plane. Each example has its own Dockerfile, defaults to port `8080`, and can be run locally or deployed via the Out Plane console.

- Explore the platform: https://outplane.com
- Deploy from the dashboard: https://console.outplane.com

## Quick start
```bash
cd <example-directory>
docker build -t <example-name> . && docker run --rm -p 8080:8080 <example-name>
```
Then open http://localhost:8080

## Examples
- `agent-quickstart`: Go app plus managed PostgreSQL, for a first deployment driven by a coding agent. Runs without a database too.
- `express-nodejs-example`: Express API with `/info`, `/animals`, Swagger UI.
- `go-example`: Minimal Go HTTP server returning env + user agent.
- `python-fastapi-example`: FastAPI echoing env/headers/runtime.
- `python-flask-example`: Simple Flask “hello” with request/runtime info.
- `python-flask-jobs-example`: Flask + APScheduler; UI to enqueue fake jobs and view processing status.
- `php-laravel-example`: Laravel UI showing request/env/runtime.
- `nextjs-example`: Next.js single page with random science facts.
- `docusaurus-example`: Docusaurus docs site with a custom landing page.
- `metabase-example`: Metabase analytics UI.
- `umami-example`: Umami web analytics with PostgreSQL.
- `volume-explorer`: Go app to browse, upload, and manage files in volumes.
- `java-springboot-example`: Spring Boot (Undertow) API returning request/env info.
- `dotnet-minimal-api-example`: ASP.NET Core 8 minimal API returning request/env/runtime.

Tip: If you add new examples, keep the default port at 8080 and include a Dockerfile + README in the example folder.***
