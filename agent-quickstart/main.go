// Command agent-quickstart is the application a coding agent deploys when
// somebody wants to see Out Plane work before committing their own code to it.
//
// It is deliberately small and deliberately honest. Everything the page shows
// is read at request time from the environment the platform injected or from
// the database the agent attached. Nothing is mocked, because the whole point
// of the page is that the person is looking at their own running deployment.
//
// It also runs with no database at all, so a deployment that skipped that step
// still serves a page and says which half is missing rather than crashing.
package main

import (
	"context"
	"database/sql"
	"embed"
	"encoding/json"
	"errors"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

//go:embed web
var web embed.FS

// Run is one completed puzzle, and the only thing this application stores.
type Run struct {
	ID          int64   `json:"id"`
	Level       int     `json:"level"`
	Moves       int     `json:"moves"`
	Seconds     float64 `json:"seconds"`
	CompletedAt string  `json:"completedAt"`
}

// State is everything the page needs, in one response.
//
// One request rather than several, because the page has one job and a person
// watching their first deployment should not see it arrive in pieces.
type State struct {
	App          string `json:"app"`
	Team         string `json:"team"`
	Repository   string `json:"repository"`
	DeploymentID string `json:"deploymentId"`

	// DBConnected is the result of an actual query, not of the variable being
	// set. A DATABASE_URL that points at nothing is the interesting failure.
	DBConnected bool   `json:"dbConnected"`
	DBMessage   string `json:"dbMessage"`

	TotalRuns   int     `json:"totalRuns"`
	BestMoves   *int    `json:"bestMoves"`
	BestSeconds *float64 `json:"bestSeconds"`
	Recent      []Run   `json:"recent"`
}

type server struct {
	db *sql.DB
}

const schema = `
CREATE TABLE IF NOT EXISTS runs (
	id           BIGSERIAL PRIMARY KEY,
	level        INTEGER     NOT NULL,
	moves        INTEGER     NOT NULL,
	seconds      REAL        NOT NULL,
	completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`

func main() {
	port := env("PORT", "8080")

	s := &server{}
	if url := os.Getenv("DATABASE_URL"); url != "" {
		db, err := open(url)
		if err != nil {
			// Not fatal. A page that says the database is unreachable is more
			// use to somebody debugging their first deployment than a
			// container that exits and takes the address down with it.
			log.Printf("database unavailable, serving without it: %v", err)
		} else {
			s.db = db
			log.Print("database ready")
		}
	} else {
		log.Print("DATABASE_URL is not set, serving without a database")
	}

	assets, err := fs.Sub(web, "web")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(assets)))
	mux.HandleFunc("/api/state", s.handleState)
	mux.HandleFunc("/api/runs", s.handleRuns)
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte("ok"))
	})

	log.Printf("listening on :%s", port)
	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
	}
	log.Fatal(srv.ListenAndServe())
}

// open connects and creates the table.
//
// The connection string arrives from a managed database and already carries
// its own TLS settings, so nothing is appended to it here.
func open(url string) (*sql.DB, error) {
	db, err := sql.Open("postgres", url)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(4)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, err
	}
	if _, err := db.ExecContext(ctx, schema); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func (s *server) handleState(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, s.state(r.Context()))
}

func (s *server) handleRuns(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", http.MethodPost)
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "use POST"})
		return
	}

	var in struct {
		Level   int     `json:"level"`
		Moves   int     `json:"moves"`
		Seconds float64 `json:"seconds"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096)).Decode(&in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "malformed body"})
		return
	}
	// Bounds rather than trust. The board is generated in the browser, so the
	// numbers arriving here are a claim and not a measurement.
	if in.Level < 1 || in.Level > 99 || in.Moves < 0 || in.Moves > 9999 ||
		in.Seconds < 0 || in.Seconds > 86400 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "out of range"})
		return
	}

	if s.db == nil {
		// Deliberately not an error. The game still works, the score simply
		// does not outlive the container, which is the thing the page is
		// trying to make somebody feel.
		writeJSON(w, http.StatusOK, s.state(r.Context()))
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	_, err := s.db.ExecContext(ctx,
		`INSERT INTO runs (level, moves, seconds) VALUES ($1, $2, $3)`,
		in.Level, in.Moves, in.Seconds)
	if err != nil {
		log.Printf("insert failed: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not store the run"})
		return
	}

	writeJSON(w, http.StatusOK, s.state(ctx))
}

// state gathers the whole page in one pass.
func (s *server) state(ctx context.Context) State {
	st := State{
		App:          env("OP_APP_NAME", "this application"),
		Team:         env("OP_TEAM", ""),
		Repository:   env("OP_REPOSITORY", ""),
		DeploymentID: env("OP_DEPLOYMENT_ID", ""),
		Recent:       []Run{},
	}

	if s.db == nil {
		st.DBMessage = "No database attached. Scores live in this container and disappear when it restarts."
		return st
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var (
		total   int
		moves   sql.NullInt64
		seconds sql.NullFloat64
	)
	err := s.db.QueryRowContext(ctx,
		`SELECT count(*), min(moves), min(seconds) FROM runs`).Scan(&total, &moves, &seconds)
	if err != nil {
		st.DBMessage = "The database is attached but did not answer. Read the application logs."
		log.Printf("summary failed: %v", err)
		return st
	}

	st.DBConnected = true
	st.TotalRuns = total
	if moves.Valid {
		v := int(moves.Int64)
		st.BestMoves = &v
	}
	if seconds.Valid {
		st.BestSeconds = &seconds.Float64
	}

	rows, err := s.db.QueryContext(ctx,
		`SELECT id, level, moves, seconds, completed_at
		   FROM runs ORDER BY id DESC LIMIT 5`)
	if err != nil {
		log.Printf("recent failed: %v", err)
		return st
	}
	defer rows.Close()

	for rows.Next() {
		var r Run
		var at time.Time
		if err := rows.Scan(&r.ID, &r.Level, &r.Moves, &r.Seconds, &at); err != nil {
			log.Printf("scan failed: %v", err)
			return st
		}
		r.CompletedAt = at.UTC().Format(time.RFC3339)
		st.Recent = append(st.Recent, r)
	}
	if err := rows.Err(); err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("rows failed: %v", err)
	}
	return st
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(code)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode failed: %v", err)
	}
}

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
