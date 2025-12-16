# Python FastAPI Example

FastAPI server that echoes environment variables, request details, and user agent for Out Plane testing.

## Run locally
```bash
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8080
```

## Build and run the container (one liner)
```bash
docker build -t python-fastapi-example . && docker run --rm -p 8080:8080 python-fastapi-example
```
