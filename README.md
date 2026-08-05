# New Frontier International prototype

This repository contains the first front-end prototype for the International edition of the New Frontier student journalism website. It includes a responsive three-level header, section navigation, a five-slot homepage article grid, and reusable placeholder section pages.

## Install and run

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Routes

- `/` — International homepage
- `/news`
- `/culture`
- `/opinion`
- `/school`
- `/info`

## Masthead assets

The unchanged source masthead is stored at `public/assets/9.svg`. The transparent, tightly cropped, white header version is stored at `public/assets/new-frontier-header.svg`. The supplied source contains outlined artwork only through “NEW FRO”; the derived asset preserves that available geometry and does not invent the missing letters.

## Korean Standard Time date

The header date is generated in the browser with `Intl.DateTimeFormat`. It explicitly uses the `Asia/Seoul` time zone, so it shows the Korean Standard Time date regardless of the visitor's device time zone.

The Korean edition and real article content are intentionally not implemented in this prototype.
