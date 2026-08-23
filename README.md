# New Frontier

This repository contains the International and Korean editions of the New Frontier student newspaper, plus the prototype New Frontier Editorial publishing workspace.

## Install and run

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

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

The prototype password is `NF2026`. Authentication is stored only for the current browser session and is not production security.

Article records use a centralized service and IndexedDB repository. Uploaded cover and inline images are kept in a separate IndexedDB object store and article records store image references instead of image binaries. This device-local implementation is intentionally replaceable: a production editorial deployment should use server-side authentication, a shared database such as Cloudflare D1, and object storage such as R2.

## Masthead assets

The unchanged source masthead is stored at `public/assets/9.svg`. The transparent, tightly cropped, white header version is stored at `public/assets/new-frontier-header.svg`. The supplied source contains outlined artwork only through “NEW FRO”; the derived asset preserves that available geometry and does not invent the missing letters.

## Korean Standard Time date

The header date is generated in the browser with `Intl.DateTimeFormat`. It explicitly uses the `Asia/Seoul` time zone, so it shows the Korean Standard Time date regardless of the visitor's device time zone.
