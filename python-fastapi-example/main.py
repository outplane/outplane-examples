import os
import platform
import socket
import time
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, Request

app = FastAPI()

START_TIME = time.time()


@app.get("/")
async def root(request: Request):
    headers = dict(request.headers)
    env = dict(os.environ)

    return {
        "message": "FastAPI example reporting environment variables and user agent on Out Plane",
        "requestId": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "method": request.method,
        "path": request.url.path,
        "fullUrl": str(request.url),
        "ip": request.client.host if request.client else "",
        "host": request.headers.get("host", ""),
        "protocol": request.url.scheme,
        "userAgent": request.headers.get("user-agent", ""),
        "headers": headers,
        "env": env,
        "runtime": {
            "pythonVersion": platform.python_version(),
            "implementation": platform.python_implementation(),
            "hostname": socket.gethostname(),
            "pid": os.getpid(),
            "uptimeSeconds": round(time.time() - START_TIME, 3),
        },
    }
