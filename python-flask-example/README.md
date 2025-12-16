# Python Flask Example

Tiny Flask server that returns a friendly greeting plus basic request details, for Out Plane testing.

## Run locally
```bash
pip install -r requirements.txt
python app.py
```

## Build and run the container (one liner)
```bash
docker build -t python-flask-example . && docker run --rm -p 8080:8080 python-flask-example
```
