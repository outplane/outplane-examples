FROM golang:1.25-alpine AS builder

WORKDIR /app

# Modules first, so a change to the source does not re-resolve them.
COPY go.mod go.sum ./
RUN go mod download

COPY main.go ./
COPY web ./web

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o server

# The page, the stylesheet, the script and both typefaces are compiled into the
# binary, so the runtime image needs nothing but the binary and the roots that
# let it reach a managed database over TLS.
FROM alpine:3.21

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/server /usr/local/bin/server

EXPOSE 8080
ENV PORT=8080

CMD ["/usr/local/bin/server"]
