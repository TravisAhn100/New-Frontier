# New Frontier International

A React/Vite front-end prototype for the International edition of the New Frontier student journalism website.

## Stack

- **React 18** + **TypeScript**
- **Vite 5** (dev server on port 5000, bound to 0.0.0.0)
- **React Router v6** for client-side routing
- **pnpm** as the package manager

## Running the app

```bash
pnpm install
pnpm run dev
```

The Replit workflow "Start application" runs `pnpm run dev` automatically.

## Routes

| Path       | Page                         |
|------------|------------------------------|
| `/`        | International homepage       |
| `/news`    | News section (placeholder)   |
| `/culture` | Culture section (placeholder)|
| `/opinion` | Opinion section (placeholder)|
| `/school`  | School section (placeholder) |
| `/info`    | Info section (placeholder)   |

## Key files

- `src/components/Header.tsx` – three-level header (top strip, masthead, section nav)
- `src/hooks/useKSTDate.ts` – Korean Standard Time date via `Intl.DateTimeFormat`
- `src/pages/Home.tsx` – five-slot article grid
- `src/pages/SectionPage.tsx` – reusable placeholder section page
- `public/assets/9.svg` – source masthead asset
- `public/assets/new-frontier-header.svg` – transparent white header version

## Notes

- The KST date in the header uses `Asia/Seoul` timezone regardless of the visitor's device.
- The Korean edition and real article content are intentionally not implemented.
- Do not publish or deploy without the team's approval.

## User preferences

- Do not redesign the website, change routes, colors, text, layout, or SVG files without explicit approval.
- Keep the existing React/Vite/pnpm stack.
