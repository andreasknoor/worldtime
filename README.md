# WorldTime

A fast, clean timezone converter and meeting scheduler. See what time it is across multiple cities simultaneously, drag to select a time range, and copy it to your clipboard.

Live at: **https://worldtime-seven.vercel.app**

## Features

- Add any city from a built-in database of ~200 locations
- 24h and 12h time formats
- Drag across hours to select a range, then copy all timezones at once
- Double-click any hour to instantly copy that moment across all timezones
- DST warning when a timezone is about to change clocks within 7 days
- Reorder rows by dragging
- Set any location as your home timezone
- All locations and preferences persisted to localStorage
- Scrolls to the current hour on load

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router
- [React 19](https://react.dev)
- [Luxon](https://moment.github.io/luxon/) — timezone and DST logic
- [Tailwind CSS 4](https://tailwindcss.com)
- TypeScript
- Deployed on [Vercel](https://vercel.com)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

```bash
vercel --prod
```

Requires the [Vercel CLI](https://vercel.com/docs/cli) and an authenticated session (`vercel login`).

## Project Structure

```
app/              Next.js app router entry point and global styles
components/       UI components (grid, rows, tiles, toolbar, modals)
hooks/            usePersistedState, useLiveClock
lib/              timeUtils (formatting, offsets, DST), types
data/cities.json  Bundled city database (~200 entries)
```

## Security

- No server, no database, no user accounts — purely client-side
- No data is transmitted anywhere; all state lives in localStorage
- Content Security Policy, X-Frame-Options, and other security headers configured in `next.config.ts`
- Run `npm audit` before deploying to check for dependency vulnerabilities
