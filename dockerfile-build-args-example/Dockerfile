FROM alpine:3.20

# Build-time args — defaults are overridden when Outplane injects env group
# variables (UseInBuild=true) as --build-arg into BuildKit.
ARG BUILD_MESSAGE=default-message
ARG BUILD_VERSION=unknown
ARG API_URL=http://localhost

# Promote ARG to ENV so the runtime container exposes the same values
ENV BUILD_MESSAGE=$BUILD_MESSAGE
ENV BUILD_VERSION=$BUILD_VERSION
ENV API_URL=$API_URL

# Echo during build so the captured values land in the Tekton build log too
RUN echo "=== Build-time captured ===" && \
    echo "BUILD_MESSAGE=$BUILD_MESSAGE" && \
    echo "BUILD_VERSION=$BUILD_VERSION" && \
    echo "API_URL=$API_URL"

RUN apk add --no-cache busybox-extras

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

# Exec form so the script inherits ENV correctly and expands ${VAR} inside
CMD ["/start.sh"]
