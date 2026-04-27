# Deploying to Railway

This guide walks through deploying the admin platform to Railway as three
services in one project: a Postgres database, the Express backend, and
the Vite dashboard.

## 0. One-time prep on your machine

Before the first deploy, generate the initial Prisma migration so that
`prisma migrate deploy` has something to run in production. From the
repo root:

```bash
cd backend
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "Add initial Prisma migration"
git push
```

If you already have a local database with the schema applied via
`prisma db push`, the migration will be marked as already applied
locally. The migration files themselves are what production needs.

Generate a strong JWT secret you'll use for the backend env var:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 1. Create the Railway project

1. In Railway, **New Project → Deploy from GitHub repo →** pick
   `bnna-studio/admin-platform`.
2. When prompted, deploy the `main` branch (or whichever branch you
   want production to track).

## 2. Add the Postgres database

1. In the project, **+ New → Database → Add PostgreSQL**.
2. Railway provisions Postgres and exposes a `DATABASE_URL` variable on
   the project. The backend will reference it.

## 3. Configure the backend service

Railway will likely auto-create one service from the repo. If it picked
the wrong root, delete it and recreate as below.

1. **+ New → GitHub Repo →** select `admin-platform`.
2. Open the new service → **Settings → Source**:
   - **Root Directory**: `backend`
   - **Watch Paths**: `backend/**` (so dashboard-only commits don't
     trigger backend redeploys)
3. **Settings → Build**: leave Nixpacks defaults. The backend
   `package.json` defines `build` (`prisma generate`) and `start`
   (`prisma migrate deploy && node src/server.js`) so Railway uses
   those automatically.
4. **Variables** → add:
   - `DATABASE_URL` → click "Add Reference" and pick the Postgres
     service's `DATABASE_URL`. Don't paste the value directly; the
     reference auto-updates if Postgres credentials rotate.
   - `JWT_SECRET` → the random string you generated above.
   - `CORS_ORIGINS` → leave empty for now; you'll fill this in step 5
     once the dashboard URL exists.
   - `NODE_ENV` → `production`.
   - Don't set `PORT` — Railway injects it automatically and the server
     reads `process.env.PORT`.
5. **Settings → Networking → Generate Domain**. You'll get something
   like `admin-platform-api.up.railway.app`. Note it down.

## 4. Configure the dashboard service

1. **+ New → GitHub Repo →** select `admin-platform` again.
2. **Settings → Source**:
   - **Root Directory**: `dashboard`
   - **Watch Paths**: `dashboard/**`
3. **Variables** → add:
   - `VITE_API_URL` → `https://<the backend domain from step 3>`
     (no trailing slash). Vite inlines this at build time, so the
     value must be set before the build runs.
4. **Settings → Networking → Generate Domain**. You'll get something
   like `admin-platform-dashboard.up.railway.app`.
5. The dashboard `package.json` defines `build` (`vite build`) and
   `start` (`vite preview --host 0.0.0.0 --port $PORT`); Railway will
   use those.

## 5. Wire CORS back to the backend

Now that the dashboard has a domain, go back to the backend service:

1. **Variables** → set
   `CORS_ORIGINS=https://<the dashboard domain from step 4>`
   (no trailing slash). Multiple origins are comma-separated.
2. Redeploy the backend.

## 6. First-run sanity check

1. Open the dashboard URL → register an organization → create a site.
2. Hit the public API to confirm it works from any origin:
   ```bash
   curl https://<backend>/public/sites/<apiKey>/seo
   ```
3. From the dashboard, exercise the Listings and SEO flows.

## 7. (Optional) Custom domains

In each service, **Settings → Networking → Custom Domain**:

- Backend: `api.moaicreative.com` → CNAME to the Railway domain.
- Dashboard: `admin.moaicreative.com` → CNAME to the Railway domain.

After DNS propagates, update the backend `CORS_ORIGINS` to include the
custom dashboard domain, and update the dashboard `VITE_API_URL` to the
custom backend domain. Redeploy both.

## Notes

- Schema changes flow through Prisma migrations:
  `npx prisma migrate dev --name <change>` locally, commit the new
  migration directory, push. Railway runs `prisma migrate deploy` on
  every backend boot.
- The public API routes (`/public/*`) and `/health` are intentionally
  open to all origins so client websites can fetch their SEO/listings
  with just an API key. Only the admin routes are CORS-restricted.
- If a deploy fails on the backend with a Prisma migration error,
  inspect the build logs — it's almost always a migration that wasn't
  generated locally before deploying.
