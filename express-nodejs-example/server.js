const express = require("express");
const { randomUUID } = require("crypto");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = process.env.PORT || 8080;

const animals = [
  "Cat",
  "Dog",
  "Horse",
  "Lion",
  "Tiger",
  "Koala",
  "Panda",
  "Eagle",
  "Shark",
  "Dolphin",
  "Falcon",
  "Otter",
  "Fox",
  "Wolf",
];

const swaggerDoc = {
  openapi: "3.0.0",
  info: {
    title: "Express Example API",
    version: "1.0.0",
    description: "Simple API returning request info and animal data.",
  },
  servers: [{ url: "/", description: "Same origin" }],
  paths: {
    "/": {
      get: {
        summary: "Request info",
        responses: {
          200: {
            description: "Request and environment details",
          },
        },
      },
    },
    "/info": {
      get: {
        summary: "Request info (alias)",
        responses: {
          200: {
            description: "Request and environment details",
          },
        },
      },
    },
    "/animals": {
      get: {
        summary: "List all animals",
        responses: {
          200: {
            description: "Animal list",
          },
        },
      },
    },
    "/animals/random": {
      get: {
        summary: "Random animal",
        responses: {
          200: {
            description: "Returns one random animal",
          },
        },
      },
    },
  },
};

const buildInfo = (req) => ({
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
    uptimeSeconds: Number(process.uptime().toFixed(3)),
  },
  env: process.env,
});

app.get("/", (_req, res) => {
  res.redirect("/docs");
});

app.get("/info", (req, res) => {
  res.json(buildInfo(req));
});

app.get("/animals", (_req, res) => {
  res.json({ count: animals.length, animals });
});

app.get("/animals/random", (_req, res) => {
  const pick = animals[Math.floor(Math.random() * animals.length)];
  res.json({ animal: pick });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.get("/docs.json", (_req, res) => res.json(swaggerDoc));

app.listen(port, () => {
  console.log(`Server listening on port ${port} (Swagger at /docs)`);
});
