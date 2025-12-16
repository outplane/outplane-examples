FROM golang:1.21-alpine AS builder

WORKDIR /app

# Keep modules slim; only stdlib is required.
COPY go.mod ./
COPY main.go ./

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server

# Minimal runtime image.
FROM scratch

WORKDIR /app
COPY --from=builder /app/server /usr/local/bin/server

EXPOSE 8080
ENV PORT=8080

CMD ["/usr/local/bin/server"]
