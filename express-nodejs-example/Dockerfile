FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --only=production

COPY server.js ./

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]
