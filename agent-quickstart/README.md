# Agent Quickstart

The application a coding agent deploys when somebody wants to see Out Plane work before
committing their own code to it.

It serves one page. The page reports the deployment it is running inside, connects to a
managed PostgreSQL database, and holds a small puzzle whose completed runs are written to
that database and read back underneath it. The point of the puzzle is the rows: they are
still there after a redeploy, because they live in the database rather than in the container.

It runs without a database too. The page then says so, and the scores last until the
container restarts.

## Deploy it

Two resources, in this order, because the application wants the connection string at the
moment it is created.

```bash
outplane db create quickstartdb --region aws-eu-central-1
```

`db create` returns before the database is usable, so wait for it:

```bash
outplane db get quickstartdb --json --fields status
```

When `status` reads `active`, create the application. The repository is public, so nothing
needs connecting first:

```bash
outplane app create <APP_NAME> \
  --repo outplane/outplane-examples \
  --branch main \
  --public-repo \
  --dir agent-quickstart \
  --port 8080:http:public \
  --env DATABASE_URL="$(outplane db url quickstartdb)" \
  --json
```

`outplane db url` on its own prints the bare connection string, which is what the
substitution needs. Adding `--json` would put a JSON object into the variable instead. The
value is never echoed back by `app create`, which reports `envCount` and not the value.

Then follow the deployment and read the address:

```bash
outplane deploy get <DEPLOYMENT_ID> <APP_NAME> --json --fields status
outplane app get <APP_NAME> --json --fields status,url
```

The build takes under a minute. `status` moves `queued` to `building` to `deploying` to
`ready`, and the address is in `url` once it does.

The full procedure, including what to do with every failure along the way, is at
[docs.outplane.com/docs/cli/agents](https://docs.outplane.com/docs/cli/agents).

## Clean up

```bash
outplane app delete <APP_NAME>
outplane db delete quickstartdb
```

Delete the application first, since the database is what it is holding open. Both are
destructive, so both stop and hand back the exact command that would proceed. Running under
a coding agent they refuse whatever flags they are given, including `--yes` and
`--confirm-name`, so these two are the person's to run.

The database is a separate resource. Deleting the application on its own leaves it running.

## Run it locally

```bash
go run .
```

Then open `http://localhost:8080`. With no `DATABASE_URL` it serves the page and says the
database is missing. To run it against a real one:

```bash
DATABASE_URL="$(outplane db url quickstartdb)" go run .
```

With Docker:

```bash
docker build -t agent-quickstart .
docker run --rm -p 8080:8080 -e DATABASE_URL="…" agent-quickstart
```

## What it reads

| Variable | Set by | Used for |
| --- | --- | --- |
| `PORT` | The platform | Which port to listen on. Defaults to 8080 |
| `DATABASE_URL` | You, at create time | Where to store runs. Absent is a supported state |
| `OP_APP_NAME`, `OP_TEAM`, `OP_REPOSITORY`, `OP_DEPLOYMENT_ID` | The platform | Shown on the page, so the values are the deployment's own rather than something typed in |

## The table

One table, created at startup if it is not there.

```sql
CREATE TABLE IF NOT EXISTS runs (
	id           BIGSERIAL PRIMARY KEY,
	level        INTEGER     NOT NULL,
	moves        INTEGER     NOT NULL,
	seconds      REAL        NOT NULL,
	completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Layout

```
main.go            server, database, one JSON endpoint for the page
web/index.html     the page
web/style.css      the console's design tokens, carried across
web/app.js         the puzzle and the rendering
web/fonts/         Archivo and IBM Plex Mono, served from the binary
```

Both typefaces are under the SIL Open Font License, and the licences travel with them in
`web/fonts/`.
