# Docusaurus Example

Minimal Docusaurus docs site with a custom landing page for Out Plane testing.

## Run locally
```bash
npm install
npm run start -- --host 0.0.0.0 --port 8080
```

## Build and run the container (one liner)
```bash
docker build -t docusaurus-example . && docker run --rm -p 8080:8080 docusaurus-example
```

Then open http://localhost:8080

Environment:
- `PORT` (default `8080`)
