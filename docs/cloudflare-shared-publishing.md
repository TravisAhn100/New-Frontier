# Cloudflare shared publishing setup

New Frontier uses one Cloudflare Worker to serve the Vite application and the `/api/*` routes. D1 stores article records and R2 stores uploaded image bytes.

## Production resources

Authenticate Wrangler with the Cloudflare account that owns the site:

```bash
pnpm exec wrangler login
```

Create the shared article database:

```bash
pnpm exec wrangler d1 create new-frontier-editorial
```

Copy the returned `database_id` into the `DB` entry in `wrangler.jsonc`, replacing `00000000-0000-0000-0000-000000000000`.

Create the image bucket:

```bash
pnpm exec wrangler r2 bucket create new-frontier-article-images
```

The configured binding names are:

- `DB` — D1 article database
- `ARTICLE_IMAGES` — R2 image bucket
- `ASSETS` — compiled Vite assets

## Editorial secrets

Store the temporary shared password and a long random signing secret as encrypted Worker secrets:

```bash
pnpm exec wrangler secret put EDITORIAL_PASSWORD
pnpm exec wrangler secret put EDITORIAL_SESSION_SECRET
```

Enter `NF2026` for `EDITORIAL_PASSWORD` if the existing prototype password must remain active. Use a long, independently generated random value for `EDITORIAL_SESSION_SECRET`. Never add either production value to source control.

The signed editorial session lasts eight hours by default. `EDITORIAL_SESSION_TTL_SECONDS` in `wrangler.jsonc` controls that duration.

## Apply the database migration

Apply the checked-in schema to the production D1 database:

```bash
pnpm run db:migrate:remote
```

The first successful article API request inserts the existing baseline International and Korean articles once. Seed inserts use `INSERT OR IGNORE`, so baseline content does not overwrite an existing record. The `app_metadata` table records the applied seed version.

## Local development

Copy `.dev.vars.example` to `.dev.vars`. The latter is ignored by Git.

Then run:

```bash
pnpm install
pnpm run build
pnpm run db:migrate:local
pnpm run dev:api
```

In a second terminal:

```bash
pnpm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` to the Worker on port 8787. For an integrated production-style local preview after a build, open `http://127.0.0.1:8787` while `pnpm run preview:worker` is running.

## Deployment

After the real D1 database ID, R2 bucket, secrets, and remote migration are in place:

```bash
pnpm run build
pnpm exec wrangler deploy
```

The Worker serves compiled assets and handles `/api/*` before the SPA fallback.

## Data and image behavior

- Both drafts and published articles are D1 records.
- Structured topics, authors, and body blocks are serialized as JSON columns rather than HTML.
- Public article endpoints return only records whose status is `published`.
- Editorial reads and all mutations require a valid signed, HTTP-only session cookie.
- Uploads are stored in R2 and articles retain stable same-origin `/api/images/...` references, never `blob:` URLs or base64 data.
- Deleting an article removes an owned R2 image only after the API confirms no other article still references it.
- An uploaded file that is never attached to a saved article can remain orphaned. A scheduled orphan-cleanup job is not included in this update.

## IndexedDB migration limitation

The application no longer reads or writes the old `new-frontier-editorial` IndexedDB database. Existing records trapped in a particular browser are not automatically migrated because the server cannot access a visitor's browser storage. The old local database is left untouched so its data is not destructively erased; recovering it would require an explicit browser-side export/import tool.

## Authentication limitation

The password is now checked server-side and mutations are protected by a signed cookie plus same-origin checks, which prevents anonymous public writes and keeps the signing secret out of frontend code. It is still a shared-password prototype, not production newsroom identity. Before wider editorial access, replace it with individual accounts, authorization roles, login rate limiting, audit logging, and a password-reset/revocation process.
