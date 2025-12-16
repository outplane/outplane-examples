# Go Example

Small HTTP server that returns environment variables and the caller's user agent as JSON.

## Run locally
```bash
go run .
```

## Build and run the container (one liner)
```bash
docker build -t go-example . && docker run --rm -p 8080:8080 go-example
```
