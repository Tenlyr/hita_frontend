# Hita Frontend

Next.js frontend for Hita Frontend, built on Next.js 16 (App Router), Tailwind CSS v4, and shadcn/ui.

## Stack

- **Next.js 16** — App Router
- **Tailwind CSS v4** — CSS-first config in `src/app/globals.css` (no `tailwind.config.ts`)
- **shadcn/ui** (base-nova style) — primitives in `src/components/ui/`
- **Axios** — API client with automatic token refresh (`src/lib/axios.ts`)
- **Cookie-based JWT auth** — helpers in `src/lib/auth.ts`
- **Zustand** — client state

## Getting Started

```bash
cp .env.example .env.local   # then fill in values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/            App Router routes ((landing), dashboard/...)
  components/     shared UI (components/ui = shadcn primitives)
  hooks/          shared React hooks
  lib/            auth.ts, axios.ts, utils.ts
  services/       API layer (x.service.ts)
  types/          shared TS types (x.types.ts)
  constants/      config.ts (env + cookie names), routes.ts
```

See `docs/FOLDER_STRUCTURE.md` for the full folder conventions this project follows.

## Environment variables

See `.env.example`. All client-visible values use the `NEXT_PUBLIC_` prefix and are
centralized in `src/constants/config.ts` — never read `process.env` directly elsewhere.

---

© 2026 Dhinesh
