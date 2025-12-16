# Java Spring Boot Example

Minimal Spring Boot 3 API that returns request + environment info as JSON for Out Plane testing.

## Run locally
```bash
mvn spring-boot:run
```

Or build the jar:
```bash
mvn -DskipTests package
java -jar target/java-springboot-example-0.0.1-SNAPSHOT.jar --server.port=8080
```

## Endpoints
- `GET /`: redirects to `/info`
- `GET /info`: returns request/env/runtime info

## Build and run the container (one liner)
```bash
docker build -t java-springboot-example . && docker run --rm -p 8080:8080 java-springboot-example
```

Environment:
- `PORT` (default `8080`)

Note: Uses Undertow (not Tomcat), so local env hostnames with underscores won't be rejected.
