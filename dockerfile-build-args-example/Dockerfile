FROM alpine:3.20

# Build-time args — defaults are overridden when Outplane injects env group
# variables (UseInBuild=true) as --build-arg into BuildKit.
ARG BUILD_MESSAGE=default-message
ARG BUILD_VERSION=unknown
ARG API_URL=http://localhost

# Promote ARG to ENV so the runtime container shows the same values
ENV BUILD_MESSAGE=$BUILD_MESSAGE
ENV BUILD_VERSION=$BUILD_VERSION
ENV API_URL=$API_URL

# Echo during build so the captured values land in the Tekton build log too
RUN echo "=== Build-time captured ===" && \
    echo "BUILD_MESSAGE=$BUILD_MESSAGE" && \
    echo "BUILD_VERSION=$BUILD_VERSION" && \
    echo "API_URL=$API_URL"

RUN apk add --no-cache busybox-extras

EXPOSE 8080

CMD echo "=== Runtime env ===" && \
    env | grep -E '^(BUILD_|API_)' && \
    mkdir -p /www && \
    printf '<!doctype html><title>Build args</title><h1>Build args captured at build time</h1><ul><li>BUILD_MESSAGE: %s</li><li>BUILD_VERSION: %s</li><li>API_URL: %s</li></ul>' \
      "$BUILD_MESSAGE" "$BUILD_VERSION" "$API_URL" > /www/index.html && \
    httpd -f -p 8080 -h /www
