# DHC Buildout Tracker

Construction/buildout progress tracker for Dave's Hot Chicken franchise locations
(Hotchkiss Holdings / TraditioCo).

**Stack:** React + Vite + Tailwind, deployed as a Cloudflare Pages site. Data lives in
a Cloudflare D1 database, read/written through small Pages Functions (`/functions/api/*`).
No third-party auth service — a single admin passphrase unlocks editing; everyone else
gets read-only access. No accounts, no Supabase.

## How it works

- **Reading data is always open** — anyone with the link can view every store's board.
- **Editing requires the admin passphrase.** Clicking "Unlock editing" in the nav and
  entering the passphrase sets a signed, HttpOnly cookie (30 days) that the API checks
  on every write. There's no user database — just one shared passphrase.
- **All data lives in D1** (SQLite on Cloudflare's edge). Stores, the master vendor
  list, each store's vendor board (`store_vendors`), and the update log are all
  regular tables — see `migrations/schema.sql`.

## One-time setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the D1 database (once, in the Cloudflare dashboard or CLI)

```bash
npx wrangler d1 create dhc_tracker_db
```

This prints a `database_id`. Put it into `wrangler.toml`, replacing
`REPLACE-WITH-D1-DATABASE-ID`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "dhc_tracker_db"
database_id = "your-real-database-id-here"
```

### 3. Apply the schema and seed data to the real (remote) database

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

`seed.sql` loads the four stores and the full master vendor list from the spec.
It deliberately does **not** attach any vendor to any store — add vendors to a
store's board only when they're actually in use for that buildout.

### 4. Create the Cloudflare Pages project

Push this repo to GitHub, then in the Cloudflare dashboard:
**Workers & Pages → Create → Pages → Connect to Git**, pick the repo, and set:

- Build command: `npm run build`
- Build output directory: `dist`

### 5. Bind the D1 database in the Pages project

In the Pages project's **Settings → Functions → D1 database bindings**, add a binding
named `DB` pointing at `dhc_tracker_db`, for **both** the Production and Preview
environments. (The `wrangler.toml` entry covers local dev; the dashboard binding is
what production actually uses.)

### 6. Set the two secrets

In **Settings → Environment variables** (as *Secret*, not plaintext), for both
Production and Preview:

- `ADMIN_PASSPHRASE` — whatever passphrase you want to hand out for editing.
- `SESSION_SECRET` — any long random string (used to sign the login cookie). Generate
  one with `openssl rand -hex 32` or similar — it never needs to be typed by a human.

### 7. Point your domain at it

Add `dev.thehotchkissgroup.co` as a custom domain on the Pages project (Cloudflare
handles the DNS/SSL if the zone is already on Cloudflare).

Push to your main branch and Cloudflare Pages builds and deploys automatically from
then on.

## Local development

```bash
cp .dev.vars.example .dev.vars   # then edit in your own passphrase/secret
npm run db:migrate:local
npm run db:seed:local
npm run pages:dev
```

`pages:dev` builds the app and serves it (frontend + API functions + local D1) at
`http://127.0.0.1:8788`, matching production behavior. Plain `npm run dev` (Vite only)
works for pure UI iteration but the `/api/*` routes won't respond without `pages:dev`
or a deployed Preview.

If you ever change `database_id` in `wrangler.toml` after creating the real database,
update the matching `REPLACE-WITH-D1-DATABASE-ID` value in the `pages:dev` script in
`package.json` too — they need to match for local dev to see the same local database
across `wrangler d1 execute` and `wrangler pages dev`.

## Data model

- `stores` — one row per location (name, address, target open date, status, notes).
- `vendors` — master vendor list, shared across every store.
- `store_vendors` — join table: which vendors are on which store's board, their status,
  notes, and *optional overrides* for contact name/phone/email (falls back to the
  vendor's master record when blank — same vendor company, different rep per market).
  Deleting a row here only removes that vendor from that one store's board.
- `update_log` — one-line timestamped notes per store, optionally tied to a specific
  vendor.

## Project structure

```
src/            React app (pages, components, API client)
functions/api/  Cloudflare Pages Functions — the backend API
migrations/     schema.sql + seed.sql for D1
wrangler.toml   D1 binding + Pages build config
```
