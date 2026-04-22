# Dockerfile Build Args Example

Minimal Alpine image that demonstrates the Outplane **Environment Variable Groups** feature with `UseInBuild=true`.

Three `ARG` directives (`BUILD_MESSAGE`, `BUILD_VERSION`, `API_URL`) are captured at build time, promoted to `ENV` so the runtime container exposes them, and rendered on a tiny HTTP page on port `8080`.

## How to test

1. Deploy this folder as an Outplane app (Source: GitHub, Build method: Dockerfile).
2. Go to **Settings → Environment Groups → Create Group** with **Use during build = true**.
3. Add entries like:
   ```
   BUILD_MESSAGE=hello-from-outplane
   BUILD_VERSION=1.0.0
   API_URL=https://api.example.com
   ```
4. Link the group to the app (app's **Environment** tab or group's **Linked Apps** row).
5. Redeploy the app.

## What you should see

- **Build log (Tekton step `create-buildkit`)**:
  ```
  === Build-time captured ===
  BUILD_MESSAGE=hello-from-outplane
  BUILD_VERSION=1.0.0
  API_URL=https://api.example.com
  ```
- **Container log**: the same values under `=== Runtime env ===`.
- **HTTP `/`**: HTML page listing the three values.

If you instead leave the group unlinked (or drop the `UseInBuild` flag), the defaults (`default-message`, `unknown`, `http://localhost`) are used — proving the build arg path is what's injecting them.
