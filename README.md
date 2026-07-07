# Security Dashboard

A React + TypeScript dashboard for triaging security events — auth-gated, role-aware, and built incrementally as a day-by-day learning project.

## Features

- **Auth** — sign-in/out via Clerk, with a `ProtectedRoute` gate on the whole app shell.
- **RBAC** — three roles (`admin`, `analyst`, `viewer`) mapped to a `Permission` set (`read`, `create`, `edit`, `delete`, `assign`, `manage_users`); UI and routes (e.g. `/settings`) respect the current role via `AdminRoute` and `hasPermission`.
- **Dashboard** — stat cards plus severity/status breakdowns rendered with Recharts (bar + donut), computed from live query data.
- **Events table** — filterable, sortable, paginated list of security events with severity/status badges, backed by React Query against a mock API.
- **Event forms** — create/edit/delete with input validation and sanitization (`dompurify`).
- **Dark mode** — persisted preference, anti-flash boot script, theme-aware charts.
- **Accessibility** — accessible modal (focus trap, `Escape`/backdrop close, ARIA roles) and an app-wide a11y pass.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · TanStack Query · Zustand · Recharts · Clerk · DOMPurify

## Getting started

```bash
npm install
npm run dev     # start the dev server
npm run lint     # eslint
npm run build    # type-check + production build
npm run preview  # preview the production build
```

Set your Clerk publishable key and any other required values in `.env.local` before running the app — auth won't work without it.

## Project structure

```
src/
  components/  auth guards, dashboard charts, event UI, layout, shared ui
  lib/         api client, permissions, validation, chart colors
  pages/       route-level views (dashboard, events, event detail, settings, login)
  stores/      zustand ui state (theme, etc.)
  types/       shared domain types (SecurityEvent, Role, Severity, ...)
scripts/
  seed-mockapi.mjs  seeds the mock API with sample events
```
