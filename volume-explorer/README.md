# Volume Explorer

A simple web application to browse, upload, and manage files in Docker volumes. Built with Go for testing volume mounts on [OutPlane](https://outplane.com).

## Features

- Browse any mounted volume or directory
- Upload files to volumes
- Delete files from volumes
- Clean, dark-themed UI
- Minimal footprint (~15MB image)

## Quick Start

### With Docker

```bash
docker build -t volume-explorer .
docker run -p 8080:8080 -v my-volume:/data volume-explorer
```

### Local Development

```bash
go run main.go
```

Then open http://localhost:8080

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP server port |
| `VOLUME_PATH` | `/data` | Default volume path shown in UI |

## Usage with OutPlane

1. Deploy this application on OutPlane
2. Add a volume mount (e.g., `/data`)
3. Open the app and enter `/data` in the path input
4. Browse, upload, and manage files in your volume

## Screenshot

The UI provides:
- Path input to navigate to any directory
- File listing with name, date, and size
- Upload form for adding files
- Delete button for removing files
