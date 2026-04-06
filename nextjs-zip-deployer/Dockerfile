FROM node:22-alpine

RUN apk add --no-cache unzip

WORKDIR /app

COPY package.json server.js ./

EXPOSE 3000 4000

CMD ["node", "server.js"]
