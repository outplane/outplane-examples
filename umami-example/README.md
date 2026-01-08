# Umami Example

Umami web analytics running on port 3000 for Out Plane testing.

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://umami:umami@db:5432/umami`)
- `DATABASE_TYPE` - Database type (default `postgresql`)
- `APP_SECRET` - Secret key for encrypting secure data

## Run with Docker

```bash
docker build -t umami-example . && docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgresql://umami:umami@db:5432/umami \
  -e APP_SECRET=your-secret-key \
  umami-example
```

Then open http://localhost:3000

Default login: `admin` / `umami`
