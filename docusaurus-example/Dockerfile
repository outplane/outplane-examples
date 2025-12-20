FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npm run serve -- --host 0.0.0.0 --port ${PORT:-8080}"]
