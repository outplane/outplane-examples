import os
import platform
import socket
import uuid

from flask import Flask, jsonify, request

app = Flask(__name__)


@app.get("/")
def hello():
    return jsonify(
        {
            "message": "Hello from Flask on Out Plane",
            "requestId": str(uuid.uuid4()),
            "method": request.method,
            "path": request.path,
            "userAgent": request.headers.get("User-Agent", ""),
            "env": dict(os.environ),
            "runtime": {
                "pythonVersion": platform.python_version(),
                "hostname": socket.gethostname(),
            },
        }
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
