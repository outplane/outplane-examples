package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
)

type response struct {
	Message   string            `json:"message"`
	UserAgent string            `json:"userAgent"`
	Env       map[string]string `json:"env"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", rootHandler)

	log.Printf("starting server on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	env := make(map[string]string)
	for _, e := range os.Environ() {
		if idx := strings.Index(e, "="); idx != -1 {
			key := e[:idx]
			val := e[idx+1:]
			env[key] = val
		}
	}

	resp := response{
		Message:   "Go example reporting environment variables and user agent on Out Plane",
		UserAgent: r.UserAgent(),
		Env:       env,
	}

	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(resp); err != nil {
		log.Printf("failed to encode response: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}
