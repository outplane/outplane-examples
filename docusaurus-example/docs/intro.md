---
sidebar_position: 1
title: Welcome
---

This is a minimal Docusaurus site tailored for Out Plane demos. Use it to test a docs build and static hosting.

## Run locally
```bash
npm install
npm run start -- --host 0.0.0.0 --port 8080
```

## Build and serve
```bash
npm run build
npm run serve -- --host 0.0.0.0 --port 8080
```

## Docker
```bash
docker build -t docusaurus-example .
docker run --rm -p 8080:8080 docusaurus-example
```
