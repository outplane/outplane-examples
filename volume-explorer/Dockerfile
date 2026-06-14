FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY main.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server

# Minimal runtime image
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/server /usr/local/bin/server

# Create default data directory
RUN mkdir -p /data

EXPOSE 8080

ENV PORT=8080
ENV VOLUME_PATH=/data

# Run as root: hcloud block PVCs mount as root:root, so a non-root user can't
# write to /data. Running as root lets the app write the mounted volume out of
# the box (same approach Railway/Fly use for volume-backed apps).
USER root

CMD ["/usr/local/bin/server"]
