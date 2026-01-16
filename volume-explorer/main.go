package main

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type FileInfo struct {
	Name    string
	Size    int64
	IsDir   bool
	ModTime string
}

type PageData struct {
	CurrentPath string
	ParentPath  string
	Files       []FileInfo
	Error       string
	Success     string
	BasePath    string
}

var basePath string

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Volume Explorer - OutPlane</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .file-icon::before { content: "📄"; }
        .folder-icon::before { content: "📁"; }
    </style>
</head>
<body class="bg-gray-900 text-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-blue-400 mb-2">Volume Explorer</h1>
            <p class="text-gray-400">OutPlane Volume Test Application</p>
        </header>

        <!-- Path Navigation -->
        <div class="bg-gray-800 rounded-lg p-4 mb-6">
            <form method="GET" action="/" class="flex gap-2">
                <input
                    type="text"
                    name="path"
                    value="{{.CurrentPath}}"
                    placeholder="Enter volume path (e.g., /data)"
                    class="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                >
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium transition">
                    Browse
                </button>
            </form>
        </div>

        {{if .Error}}
        <div class="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {{.Error}}
        </div>
        {{end}}

        {{if .Success}}
        <div class="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-6">
            {{.Success}}
        </div>
        {{end}}

        {{if .CurrentPath}}
        <!-- Breadcrumb -->
        <div class="text-sm text-gray-400 mb-4">
            <span class="text-gray-500">Path:</span>
            <span class="text-blue-400 font-mono">{{.CurrentPath}}</span>
        </div>

        <!-- Upload Form -->
        <div class="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 class="text-lg font-semibold mb-3 text-gray-200">Upload File</h2>
            <form method="POST" action="/upload" enctype="multipart/form-data" class="flex gap-2 items-center">
                <input type="hidden" name="path" value="{{.CurrentPath}}">
                <input
                    type="file"
                    name="file"
                    class="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                >
                <button type="submit" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition text-sm">
                    Upload
                </button>
            </form>
        </div>

        <!-- File List -->
        <div class="bg-gray-800 rounded-lg overflow-hidden">
            <div class="px-4 py-3 bg-gray-750 border-b border-gray-700">
                <h2 class="font-semibold text-gray-200">Files & Directories</h2>
            </div>

            {{if .ParentPath}}
            <a href="/?path={{.ParentPath}}" class="flex items-center px-4 py-3 hover:bg-gray-700 border-b border-gray-700 transition">
                <span class="folder-icon mr-3"></span>
                <span class="text-blue-400">..</span>
                <span class="ml-auto text-gray-500 text-sm">Parent Directory</span>
            </a>
            {{end}}

            {{if .Files}}
                {{range .Files}}
                <div class="flex items-center px-4 py-3 hover:bg-gray-700 border-b border-gray-700 transition group">
                    {{if .IsDir}}
                        <span class="folder-icon mr-3"></span>
                        <a href="/?path={{$.CurrentPath}}/{{.Name}}" class="text-blue-400 hover:underline flex-1">{{.Name}}/</a>
                    {{else}}
                        <span class="file-icon mr-3"></span>
                        <span class="flex-1">{{.Name}}</span>
                    {{end}}
                    <span class="text-gray-500 text-sm mr-4">{{.ModTime}}</span>
                    <span class="text-gray-500 text-sm w-24 text-right">{{if .IsDir}}-{{else}}{{.Size}} B{{end}}</span>
                    {{if not .IsDir}}
                    <form method="POST" action="/delete" class="ml-4 opacity-0 group-hover:opacity-100 transition">
                        <input type="hidden" name="path" value="{{$.CurrentPath}}">
                        <input type="hidden" name="file" value="{{.Name}}">
                        <button type="submit" class="text-red-400 hover:text-red-300 text-sm" onclick="return confirm('Delete {{.Name}}?')">
                            Delete
                        </button>
                    </form>
                    {{end}}
                </div>
                {{end}}
            {{else}}
                <div class="px-4 py-8 text-center text-gray-500">
                    Directory is empty
                </div>
            {{end}}
        </div>
        {{else}}
        <!-- Welcome Message -->
        <div class="bg-gray-800 rounded-lg p-8 text-center">
            <div class="text-6xl mb-4">📂</div>
            <h2 class="text-xl font-semibold mb-2">Welcome to Volume Explorer</h2>
            <p class="text-gray-400 mb-4">Enter a volume path above to browse files and directories.</p>
            <p class="text-gray-500 text-sm">Default volume path: <code class="bg-gray-700 px-2 py-1 rounded">{{.BasePath}}</code></p>
        </div>
        {{end}}

        <!-- Footer -->
        <footer class="mt-8 text-center text-gray-500 text-sm">
            <p>Volume Explorer for <a href="https://outplane.com" class="text-blue-400 hover:underline">OutPlane</a></p>
        </footer>
    </div>
</body>
</html>`

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	basePath = os.Getenv("VOLUME_PATH")
	if basePath == "" {
		basePath = "/data"
	}

	http.HandleFunc("/", browseHandler)
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/delete", deleteHandler)

	log.Printf("Volume Explorer starting on :%s", port)
	log.Printf("Default volume path: %s", basePath)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func browseHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.New("page").Parse(htmlTemplate))

	path := r.URL.Query().Get("path")
	success := r.URL.Query().Get("success")

	data := PageData{
		BasePath:    basePath,
		CurrentPath: path,
		Success:     success,
	}

	if path == "" {
		tmpl.Execute(w, data)
		return
	}

	// Clean and validate path
	cleanPath := filepath.Clean(path)
	data.CurrentPath = cleanPath

	// Calculate parent path
	if cleanPath != "/" {
		data.ParentPath = filepath.Dir(cleanPath)
	}

	// Read directory
	entries, err := os.ReadDir(cleanPath)
	if err != nil {
		data.Error = fmt.Sprintf("Cannot read directory: %v", err)
		tmpl.Execute(w, data)
		return
	}

	// Build file list
	var files []FileInfo
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}
		files = append(files, FileInfo{
			Name:    entry.Name(),
			Size:    info.Size(),
			IsDir:   entry.IsDir(),
			ModTime: info.ModTime().Format("2006-01-02 15:04"),
		})
	}

	// Sort: directories first, then by name
	sort.Slice(files, func(i, j int) bool {
		if files[i].IsDir != files[j].IsDir {
			return files[i].IsDir
		}
		return strings.ToLower(files[i].Name) < strings.ToLower(files[j].Name)
	})

	data.Files = files
	tmpl.Execute(w, data)
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	// Parse multipart form (max 32MB)
	r.ParseMultipartForm(32 << 20)

	path := r.FormValue("path")
	if path == "" {
		http.Redirect(w, r, "/?error=No+path+specified", http.StatusSeeOther)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Redirect(w, r, fmt.Sprintf("/?path=%s&error=No+file+selected", path), http.StatusSeeOther)
		return
	}
	defer file.Close()

	// Create destination file
	destPath := filepath.Join(path, header.Filename)
	dest, err := os.Create(destPath)
	if err != nil {
		http.Redirect(w, r, fmt.Sprintf("/?path=%s&error=Cannot+create+file", path), http.StatusSeeOther)
		return
	}
	defer dest.Close()

	// Copy content
	written, err := io.Copy(dest, file)
	if err != nil {
		http.Redirect(w, r, fmt.Sprintf("/?path=%s&error=Upload+failed", path), http.StatusSeeOther)
		return
	}

	log.Printf("Uploaded: %s (%d bytes)", destPath, written)
	http.Redirect(w, r, fmt.Sprintf("/?path=%s&success=File+uploaded:+%s", path, header.Filename), http.StatusSeeOther)
}

func deleteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	path := r.FormValue("path")
	filename := r.FormValue("file")

	if path == "" || filename == "" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	filePath := filepath.Join(path, filename)

	// Safety check: don't allow deleting directories
	info, err := os.Stat(filePath)
	if err != nil || info.IsDir() {
		http.Redirect(w, r, fmt.Sprintf("/?path=%s&error=Cannot+delete", path), http.StatusSeeOther)
		return
	}

	err = os.Remove(filePath)
	if err != nil {
		http.Redirect(w, r, fmt.Sprintf("/?path=%s&error=Delete+failed", path), http.StatusSeeOther)
		return
	}

	log.Printf("Deleted: %s", filePath)
	http.Redirect(w, r, fmt.Sprintf("/?path=%s&success=File+deleted:+%s", path, filename), http.StatusSeeOther)
}

func init() {
	// Set timezone
	time.Local = time.UTC
}
