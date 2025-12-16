# Python Flask Background Jobs Example

Flask app with APScheduler that simulates background jobs without external queues. `/enqueue` adds a fake job to an in-memory queue, a scheduler processes them periodically, and `/jobs` shows their status.

## Run locally
```bash
pip install -r requirements.txt
python app.py
```

## Endpoints / UI
- Web UI at `/` (enqueue button + live job list).
- API:
  - `POST /enqueue` – optional JSON `{ "description": "..." }`; returns job id and status.
  - `GET /jobs` – list all jobs + queue depth.
  - `GET /jobs/<id>` – single job detail.
  - `GET /api` – short info message.

## Build and run the container (one liner)
```bash
docker build -t python-flask-jobs-example . && docker run --rm -p 8080:8080 python-flask-jobs-example
```

Environment:
- `PORT` (default `8080`)
