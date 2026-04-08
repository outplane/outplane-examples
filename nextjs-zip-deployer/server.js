const http = require("http");
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const UPLOAD_PORT = 4000;
const APP_PORT = 3000;
const WORKSPACE = "/workspace/app";
const STAGING = "/workspace/staging";
const PNPM_STORE = "/workspace/.pnpm-store";
const LOCK_HASH_FILE = "/workspace/.lockhash";
const MAX_ZIP_SIZE = 200 * 1024 * 1024; // 200MB

let appProcess = null;
let deploying = false;

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function ensureDirs() {
  for (const d of [WORKSPACE, STAGING, PNPM_STORE]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function hashFile(file) {
  if (!fs.existsSync(file)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function readStoredHash() {
  try {
    return fs.readFileSync(LOCK_HASH_FILE, "utf-8").trim();
  } catch {
    return null;
  }
}

function writeStoredHash(hash) {
  fs.writeFileSync(LOCK_HASH_FILE, hash || "");
}

function extractZip(zipPath) {
  // Clean staging, extract into it
  fs.rmSync(STAGING, { recursive: true, force: true });
  fs.mkdirSync(STAGING, { recursive: true });

  execSync(`unzip -o -q "${zipPath}" -d "${STAGING}"`, { stdio: "pipe" });

  // If zip contains a single root folder, move contents up
  const entries = fs.readdirSync(STAGING).filter((e) => e !== "__MACOSX");
  if (entries.length === 1) {
    const inner = path.join(STAGING, entries[0]);
    if (fs.statSync(inner).isDirectory()) {
      const innerEntries = fs.readdirSync(inner);
      for (const entry of innerEntries) {
        fs.renameSync(path.join(inner, entry), path.join(STAGING, entry));
      }
      fs.rmdirSync(inner);
    }
  }
}

function validateStaging() {
  const pkgPath = path.join(STAGING, "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error("No package.json found in ZIP root");
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps["next"]) {
    throw new Error("Not a Next.js project (no 'next' dependency)");
  }

  return pkg;
}

function syncToWorkspace() {
  // rsync preserves node_modules in workspace (excluded) so HMR picks up
  // file changes and we don't nuke installed deps
  console.log("[deployer] Syncing files into live workspace...");
  execSync(
    `rsync -a --delete --exclude=node_modules --exclude=.next "${STAGING}/" "${WORKSPACE}/"`,
    { stdio: "inherit" }
  );
}

function maybeInstall() {
  const lockCandidates = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "package.json"];
  let lockFile = null;
  for (const f of lockCandidates) {
    if (fs.existsSync(path.join(WORKSPACE, f))) {
      lockFile = f;
      break;
    }
  }

  const currentHash = hashFile(path.join(WORKSPACE, lockFile));
  const storedHash = readStoredHash();

  if (currentHash && currentHash === storedHash && fs.existsSync(path.join(WORKSPACE, "node_modules"))) {
    console.log("[deployer] Lockfile unchanged, skipping install");
    return false;
  }

  console.log("[deployer] Lockfile changed (or first deploy), running pnpm install...");
  // --shamefully-hoist emulates npm's flat node_modules layout, so projects
  // that rely on hoisted transitive deps (common with npm-authored projects)
  // still resolve correctly.
  execSync(
    `pnpm install --prefer-offline --shamefully-hoist --store-dir=${PNPM_STORE} --config.confirmModulesPurge=false`,
    {
      cwd: WORKSPACE,
      stdio: "inherit",
      timeout: 300000,
      env: { ...process.env, CI: "1" },
    }
  );

  writeStoredHash(currentHash);
  return true;
}

function isAppAlive() {
  return appProcess !== null && !appProcess.killed && appProcess.exitCode === null;
}

function startDevServer() {
  if (isAppAlive()) return;

  console.log("[deployer] Starting next dev on port %d...", APP_PORT);
  const child = spawn("pnpm", ["exec", "next", "dev", "-p", String(APP_PORT), "-H", "0.0.0.0"], {
    cwd: WORKSPACE,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
    env: { ...process.env, NODE_ENV: "development", PORT: String(APP_PORT) },
  });

  child.stdout.on("data", (data) => process.stdout.write("[app] " + data));
  child.stderr.on("data", (data) => process.stderr.write("[app:err] " + data));
  child.on("exit", (code) => {
    console.log("[deployer] next dev exited with code %d", code);
    if (appProcess === child) appProcess = null;
  });

  appProcess = child;
}

function killApp() {
  if (!appProcess) return;
  try {
    process.kill(-appProcess.pid, "SIGTERM");
  } catch {}
  const pid = appProcess.pid;
  setTimeout(() => {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {}
  }, 5000);
  appProcess = null;
}

async function handleUpload(req, res) {
  if (deploying) {
    return json(res, 429, { error: "Another deploy is in progress" });
  }

  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data") && !contentType.includes("application/zip")) {
    return json(res, 400, {
      error: "Send ZIP as multipart/form-data (field: 'file') or raw application/zip body",
    });
  }

  deploying = true;
  const t0 = Date.now();

  try {
    const zipPath = path.join(os.tmpdir(), `upload-${Date.now()}.zip`);
    let bytesReceived = 0;

    if (contentType.includes("application/zip")) {
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(zipPath);
        req.on("data", (chunk) => {
          bytesReceived += chunk.length;
          if (bytesReceived > MAX_ZIP_SIZE) {
            req.destroy();
            ws.destroy();
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

    // --- Fast path pipeline ---
    // 1. extract to staging (workspace is untouched, app still alive)
    // 2. validate
    // 3. rsync staging -> workspace (next dev picks up changes via HMR)
    // 4. install only if lockfile hash changed
    // 5. make sure next dev is running; if not (first deploy), start it

    console.log("[deployer] Extracting ZIP into staging...");
    extractZip(zipPath);
    fs.unlinkSync(zipPath);

    const pkg = validateStaging();
    console.log("[deployer] Project: %s@%s", pkg.name || "unnamed", pkg.version || "0.0.0");

    syncToWorkspace();

    const installed = maybeInstall();

    // If install happened we restart dev, because next dev's module graph
    // doesn't always pick up a fresh node_modules; otherwise keep it alive
    // and rely on HMR.
    if (installed && isAppAlive()) {
      console.log("[deployer] Deps changed, restarting next dev...");
      killApp();
      await new Promise((r) => setTimeout(r, 500));
    }

    startDevServer();

    const elapsed = Date.now() - t0;
    json(res, 200, {
      status: "deployed",
      name: pkg.name || "unnamed",
      version: pkg.version || "0.0.0",
      port: APP_PORT,
      installed,
      elapsed_ms: elapsed,
      message: installed
        ? `Deps reinstalled, next dev restarted in ${elapsed}ms`
        : `Files synced, HMR picked up changes in ${elapsed}ms`,
    });
  } catch (err) {
    console.error("[deployer] Deploy failed:", err.message);
    json(res, 500, { error: err.message });
  } finally {
    deploying = false;
  }
}

function handleStatus(res) {
  json(res, 200, {
    running: isAppAlive(),
    pid: appProcess?.pid || null,
    port: isAppAlive() ? APP_PORT : null,
    deploying,
    workspace_ready: fs.existsSync(path.join(WORKSPACE, "package.json")),
    lockfile_hash: readStoredHash(),
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
      mode: "next dev + HMR (fast redeploy)",
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

ensureDirs();

server.listen(UPLOAD_PORT, () => {
  console.log("[deployer] Upload API listening on port %d", UPLOAD_PORT);
  console.log("[deployer] Deployed app will run on port %d", APP_PORT);

  // If workspace already has a project (persistent volume across restarts),
  // bring next dev back up immediately — no upload needed.
  if (fs.existsSync(path.join(WORKSPACE, "package.json")) && fs.existsSync(path.join(WORKSPACE, "node_modules"))) {
    console.log("[deployer] Found existing workspace, auto-starting next dev");
    startDevServer();
  }
});

process.on("SIGTERM", () => {
  console.log("[deployer] Shutting down...");
  killApp();
  server.close();
  process.exit(0);
});
