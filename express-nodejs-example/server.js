const express = require("express");
const { randomUUID } = require("crypto");

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({
    message: "Express.js example reporting environment variables and user agent on Out Plane",
    requestId: randomUUID(),
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    host: req.headers.host || "",
    protocol: req.protocol,
    userAgent: req.headers["user-agent"] || "",
    headers: req.headers,
    runtime: {
      node: process.version,
      pid: process.pid,
      uptimeSeconds: process.uptime(),
    },
    env: process.env,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
