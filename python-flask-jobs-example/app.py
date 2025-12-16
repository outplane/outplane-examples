import os
import threading
import time
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Dict, Optional

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, jsonify, request
from flask import Response
from flask import send_from_directory
import pathlib

app = Flask(__name__)

PORT = int(os.getenv("PORT", "8080"))
PROCESS_INTERVAL_SECONDS = 2

job_queue = deque()
job_store: Dict[str, dict] = {}
lock = threading.Lock()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def process_next_job():
    job_id: Optional[str] = None
    with lock:
        if job_queue:
            job_id = job_queue.popleft()
            job = job_store.get(job_id)
            if job and job["status"] == "queued":
                job["status"] = "processing"
                job["startedAt"] = now_iso()
                job["attempts"] += 1
    if not job_id:
        return

    # Simulate work outside the lock to avoid blocking other requests.
    time.sleep(0.2)
    result = "processed successfully"

    with lock:
        job = job_store.get(job_id)
        if not job:
            return
        job["status"] = "done"
        job["finishedAt"] = now_iso()
        job["result"] = result


def start_scheduler():
    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(process_next_job, "interval", seconds=PROCESS_INTERVAL_SECONDS, max_instances=1)
    scheduler.start()


@app.route("/")
def ui_root():
    return send_from_directory(pathlib.Path(__file__).parent, "index.html")


@app.route("/api")
def root():
    return jsonify(
        {
            "message": "Background job demo. POST /enqueue to add a job, GET /jobs to view status.",
            "queueDepth": len(job_queue),
            "jobCount": len(job_store),
            "intervalSeconds": PROCESS_INTERVAL_SECONDS,
        }
    )


@app.route("/enqueue", methods=["POST"])
def enqueue():
    body = request.get_json(silent=True) or {}
    description = str(body.get("description") or "").strip()
    job_id = str(uuid.uuid4())
    job = {
        "id": job_id,
        "description": description or "example job",
        "status": "queued",
        "createdAt": now_iso(),
        "startedAt": None,
        "finishedAt": None,
        "attempts": 0,
        "result": None,
    }

    with lock:
        job_store[job_id] = job
        job_queue.append(job_id)

    return jsonify({"job": job, "queueDepth": len(job_queue)})


@app.route("/jobs", methods=["GET"])
def jobs():
    with lock:
        jobs_list = list(job_store.values())
        queue_depth = len(job_queue)

    jobs_list.sort(key=lambda j: j["createdAt"], reverse=True)
    return jsonify({"count": len(jobs_list), "queueDepth": queue_depth, "jobs": jobs_list})


@app.route("/jobs/<job_id>", methods=["GET"])
def job_detail(job_id: str):
    with lock:
        job = job_store.get(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404
    return jsonify(job)


if __name__ == "__main__":
    start_scheduler()
    app.run(host="0.0.0.0", port=PORT)
