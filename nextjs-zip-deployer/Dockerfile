FROM node:22-alpine

RUN apk add --no-cache unzip rsync \
    && corepack enable \
    && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json server.js ./

# Persistent state (mount a volume here on OutPlane for hot redeploys)
RUN mkdir -p /workspace

EXPOSE 3000 4000

CMD ["node", "server.js"]
