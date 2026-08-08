module agent-quickstart

go 1.25

// The only dependency, and the smallest one that does the job: a pure Go
// PostgreSQL driver, so the build stays CGO free and the runtime image stays
// a single static binary.
require github.com/lib/pq v1.10.9
