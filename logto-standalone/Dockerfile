FROM svhd/logto:latest
ENTRYPOINT ["sh", "-c", "npm run cli db seed -- --swe --encrypt-base-role && npm run cli db alt deploy && npm start"]
