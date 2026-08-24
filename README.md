# New Frontier

This repository contains the International and Korean editions of the New Frontier student newspaper, plus the prototype New Frontier Editorial publishing workspace.

## Install and run

```bash
pnpm install
pnpm run build
pnpm run db:migrate:local
pnpm run dev:api
```

Run `pnpm run dev` in a second terminal for the Vite interface. Its `/api` requests are proxied to the local Cloudflare Worker on port 8787.

## Routes

- `/`, `/news`, `/culture`, `/opinion`, `/school`, `/info` — International edition
- `/ko` and `/ko/*` — Korean edition
- `/article/:slug` and `/ko/article/:slug` — public article pages
- `/login` — temporary editorial login
- `/edit` — protected editorial home
- `/edit/new`, `/edit/article/:id` — shared article composer
- `/edit/articles`, `/edit/archive` — editing and archive views
- `/edit/preview/:id` — protected unpublished preview

## Editorial prototype

The temporary production editorial password is stored as an encrypted Cloudflare Worker secret and is checked by the Worker instead of being embedded in the browser bundle. Successful login creates a signed, HTTP-only session cookie. This remains prototype authentication: it has no individual accounts, roles, recovery, audit trail, or rate limiting.

Cloudflare D1 is the authoritative store for drafts, published articles, metadata, and structured body blocks. Cloudflare R2 stores uploaded cover and inline image files. The React application communicates through the existing article service and a same-origin Worker API; it no longer reads or writes IndexedDB.

See [Cloudflare shared publishing setup](docs/cloudflare-shared-publishing.md) before deploying.

## Changing the Editorial Password

The production editorial password is intentionally not hard-coded in frontend or Worker source code. It is stored as the encrypted `EDITORIAL_PASSWORD` secret on the `new-frontier` Cloudflare Worker.

To change the production password, run:

```bash
pnpm exec wrangler secret put EDITORIAL_PASSWORD
```

Enter the new password at Wrangler's secure prompt. Wrangler updates the encrypted Worker secret and deploys a new Worker version; the value must never be added to `wrangler.jsonc`, TypeScript, JavaScript, or a committed environment file.

For local development, copy `.dev.vars.example` to the ignored `.dev.vars` file and set `EDITORIAL_PASSWORD` and `EDITORIAL_SESSION_SECRET` there. Use a long, independently generated local session secret and never commit `.dev.vars`.

## Masthead assets

The unchanged source masthead is stored at `public/assets/9.svg`. The transparent, tightly cropped, white header version is stored at `public/assets/new-frontier-header.svg`. The supplied source contains outlined artwork only through “NEW FRO”; the derived asset preserves that available geometry and does not invent the missing letters.

## Korean Standard Time date

The header date is generated in the browser with `Intl.DateTimeFormat`. It explicitly uses the `Asia/Seoul` time zone, so it shows the Korean Standard Time date regardless of the visitor's device time zone.
