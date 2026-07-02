# Taskly — Personal Productivity Suite



## Stack

React 19 · Vite 5 · Tailwind CSS · Dexie (IndexedDB) · Zustand · Recharts · date-fns · Lucide React · Sonner

## Features

- Tasks with priority, categories, tags, recurrence, and spaced-repetition revisions
- Dashboard with streaks, productivity stats, and daily focus view
- Calendar, Notes, Goals, Projects, Habits pages
- Statistics with charts
- Backup and restore (JSON export/import with QR code)
- Dark AMOLED theme with configurable accent colour

## Development

```bash
cd frontend
npm install
npm run dev        # dev server → http://localhost:5000
npm run build      # production build → frontend/dist/
npm run preview    # preview the build locally
```

## Deployment (Vercel)

Configured via `vercel.json` at the repo root.

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework:** Vite
- SPA routing handled via rewrites (all paths → `/index.html`)
