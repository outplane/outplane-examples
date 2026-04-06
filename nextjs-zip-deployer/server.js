const http = require("http");
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const UPLOAD_PORT = 4000;
const APP_PORT = 3000;
const WORKSPACE = "/tmp/workspace";
const MAX_ZIP_SIZE = 200 * 1024 * 1024; // 200MB

let appProcess = null;

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function killApp() {
  if (appProcess) {
    console.log("[deployer] Killing existing app (pid: %d)", appProcess.pid);
    appProcess.kill("SIGTERM");
    // Force kill after 5s
    const pid = appProcess.pid;
    setTimeout(() => {
      try {
        process.kill(pid, "SIGKILL");
      } catch {}
    }, 5000);
    appProcess = null;
  }
}

function cleanup() {
  if (fs.existsSync(WORKSPACE)) {
    fs.rmSync(WORKSPACE, { recursive: true, force: true });
  }
  fs.mkdirSync(WORKSPACE, { recursive: true });
}

function extractZip(zipPath) {
  // Use unzip CLI (available in alpine with apk add unzip)
  execSync(`unzip -o -q "${zipPath}" -d "${WORKSPACE}"`, { stdio: "pipe" });

  // If zip contains a single root folder, move contents up
  const entries = fs.readdirSync(WORKSPACE).filter((e) => e !== "__MACOSX");
  if (entries.length === 1) {
    const inner = path.join(WORKSPACE, entries[0]);
    if (fs.statSync(inner).isDirectory()) {
      const innerEntries = fs.readdirSync(inner);
      for (const entry of innerEntries) {
        fs.renameSync(path.join(inner, entry), path.join(WORKSPACE, entry));
      }
      fs.rmdirSync(inner);
    }
  }
}

function validateProject() {
  const pkgPath = path.join(WORKSPACE, "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error("No package.json found in ZIP root");
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps["next"]) {
    throw new Error("Not a Next.js project (no 'next' dependency)");
  }

  if (!pkg.scripts?.build) {
    throw new Error("No 'build' script in package.json");
  }

  return pkg;
}

function installAndBuild() {
  console.log("[deployer] Installing dependencies...");
  execSync("npm install --production=false", {
    cwd: WORKSPACE,
    stdio: "inherit",
    timeout: 300000, // 5 min
  });

  console.log("[deployer] Building Next.js app...");
  execSync("npm run build", {
    cwd: WORKSPACE,
    stdio: "inherit",
    timeout: 300000,
    env: { ...process.env, NODE_ENV: "production" },
  });
}

function startApp() {
  return new Promise((resolve, reject) => {
    console.log("[deployer] Starting Next.js on port %d...", APP_PORT);

    const child = spawn("npx", ["next", "start", "-p", String(APP_PORT)], {
      cwd: WORKSPACE,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production", PORT: String(APP_PORT) },
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        started = true;
        // Give it benefit of the doubt
        resolve(child);
      }
    }, 10000);

    child.stdout.on("data", (data) => {
      const msg = data.toString();
      process.stdout.write("[app] " + msg);
      if (!started && (msg.includes("Ready") || msg.includes(String(APP_PORT)))) {
        started = true;
        clearTimeout(timeout);
        resolve(child);
      }
    });

    child.stderr.on("data", (data) => {
      process.stderr.write("[app:err] " + data.toString());
    });

    child.on("exit", (code) => {
      console.log("[deployer] App process exited with code %d", code);
      if (appProcess === child) appProcess = null;
      if (!started) {
        started = true;
        clearTimeout(timeout);
        reject(new Error(`App exited with code ${code}`));
      }
    });
  });
}

async function handleUpload(req, res) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data") && !contentType.includes("application/zip")) {
    return json(res, 400, {
      error: "Send ZIP as multipart/form-data (field: 'file') or raw application/zip body",
    });
  }

  try {
    const zipPath = path.join(os.tmpdir(), `upload-${Date.now()}.zip`);
    let bytesReceived = 0;

    if (contentType.includes("application/zip")) {
      // Raw binary upload
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(zipPath);
        req.on("data", (chunk) => {
          bytesReceived += chunk.length;
          if (bytesReceived > MAX_ZIP_SIZE) {
            req.destroy();
            reject(new Error(`ZIP exceeds ${MAX_ZIP_SIZE / 1024 / 1024}MB limit`));
          }
          ws.write(chunk);
        });
        req.on("end", () => ws.end());
        req.on("error", reject);
        ws.on("error", reject);
        ws.on("finish", resolve);
      });
    } else {
      // Multipart form-data: parse boundary manually (no deps)
      await new Promise((resolve, reject) => {
        const boundary = contentType.split("boundary=")[1];
        if (!boundary) return reject(new Error("No boundary in multipart"));

        const chunks = [];
        req.on("data", (chunk) => {
          bytesReceived += chunk.length;
          if (bytesReceived > MAX_ZIP_SIZE) {
            req.destroy();
            return reject(new Error(`ZIP exceeds ${MAX_ZIP_SIZE / 1024 / 1024}MB limit`));
          }
          chunks.push(chunk);
        });
        req.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const boundaryBuf = Buffer.from(`--${boundary}`);

          // Find file content between headers and next boundary
          const headerEnd = buffer.indexOf("\r\n\r\n");
          if (headerEnd === -1) return reject(new Error("Invalid multipart"));

          const contentStart = headerEnd + 4;
          const endBoundary = buffer.indexOf(boundaryBuf, contentStart);
          const contentEnd = endBoundary !== -1 ? endBoundary - 2 : buffer.length;

          fs.writeFileSync(zipPath, buffer.subarray(contentStart, contentEnd));
          resolve();
        });
        req.on("error", reject);
      });
    }

    console.log("[deployer] Received ZIP (%d bytes)", bytesReceived);

    // Deploy pipeline
    killApp();
    cleanup();

    console.log("[deployer] Extracting ZIP...");
    extractZip(zipPath);
    fs.unlinkSync(zipPath);

    const pkg = validateProject();
    console.log("[deployer] Project: %s@%s", pkg.name || "unnamed", pkg.version || "0.0.0");

    installAndBuild();
    appProcess = await startApp();

    json(res, 200, {
      status: "deployed",
      name: pkg.name || "unnamed",
      version: pkg.version || "0.0.0",
      port: APP_PORT,
      message: `App is running on port ${APP_PORT}`,
    });
  } catch (err) {
    console.error("[deployer] Deploy failed:", err.message);
    json(res, 500, { error: err.message });
  }
}

function handleStatus(res) {
  json(res, 200, {
    running: appProcess !== null && !appProcess.killed,
    pid: appProcess?.pid || null,
    port: appProcess ? APP_PORT : null,
    workspace: fs.existsSync(path.join(WORKSPACE, "package.json")),
  });
}

function handleStop(res) {
  killApp();
  json(res, 200, { status: "stopped" });
}

// Upload API server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${UPLOAD_PORT}`);

  if (req.method === "POST" && url.pathname === "/upload") {
    return handleUpload(req, res);
  }

  if (req.method === "GET" && url.pathname === "/status") {
    return handleStatus(res);
  }

  if (req.method === "POST" && url.pathname === "/stop") {
    return handleStop(res);
  }

  if (req.method === "GET" && url.pathname === "/") {
    return json(res, 200, {
      service: "nextjs-zip-deployer",
      endpoints: {
        "POST /upload": "Upload ZIP (application/zip or multipart/form-data field 'file')",
        "GET /status": "Check deployed app status",
        "POST /stop": "Stop running app",
      },
      app_port: APP_PORT,
      upload_port: UPLOAD_PORT,
    });
  }

  json(res, 404, { error: "Not found" });
});

server.listen(UPLOAD_PORT, () => {
  console.log("[deployer] Upload API listening on port %d", UPLOAD_PORT);
  console.log("[deployer] Deployed apps will run on port %d", APP_PORT);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[deployer] Shutting down...");
  killApp();
  server.close();
  process.exit(0);
});
