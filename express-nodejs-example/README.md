# Express Node.js Example

Express server that returns environment variables and the caller's user agent as JSON, for Out Plane testing.

Endpoints (base `/` redirects to `/docs`; swagger uses same-origin base URL):
- `GET /` or `/info`: request + env info.
- `GET /animals`: full animal list.
- `GET /animals/random`: one random animal.
- Swagger UI: `/docs`.

## Run locally
```bash
npm install
npm start
```

## Build and run the container (one liner)
```bash
docker build -t express-nodejs-example . && docker run --rm -p 8080:8080 express-nodejs-example
```
