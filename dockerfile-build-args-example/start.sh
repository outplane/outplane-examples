#!/bin/sh
set -e

echo "=== Runtime env ==="
env | grep -E '^(BUILD_|API_)' || echo "(no matching env vars)"

mkdir -p /www
cat > /www/index.html <<EOF
<!doctype html>
<title>Build args</title>
<style>body{font-family:sans-serif;max-width:640px;margin:2rem auto;padding:0 1rem;}code{background:#f4f4f4;padding:0.1rem 0.3rem;border-radius:2px;}</style>
<h1>Build args captured at build time</h1>
<ul>
  <li><code>BUILD_MESSAGE</code>: ${BUILD_MESSAGE}</li>
  <li><code>BUILD_VERSION</code>: ${BUILD_VERSION}</li>
  <li><code>API_URL</code>: ${API_URL}</li>
</ul>
<p>Promoted from <code>ARG</code> to <code>ENV</code> in the Dockerfile. Values are injected by an Outplane environment group with <code>Use during build = true</code>.</p>
EOF

exec httpd -f -p 8080 -h /www
