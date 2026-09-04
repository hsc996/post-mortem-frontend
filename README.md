# PostMortem — Incident Wire

The frontend for PostMortem: a real-time incident tracking and mitigation dashboard for high-consequence, time-critical situations (on-call software incidents are the current implementation's home domain). It replaces unstructured incident docs with a live, deterministic system of record — built for instant legibility and safe concurrent editing during an active incident, not leisurely retrospective writing.

This is a client for the [`post-mortem`](../post-mortem) FastAPI backend, which is the source of truth for every data shape here. This app has no backend of its own — it will not run meaningfully without that API reachable.

## What makes this more than a wiki page

Three mechanisms the backend enforces and this UI makes genuinely reachable, not just decorative:

- **Optimistic locking:** every mutation sends the version it last saw; a stale write gets a real `409 Conflict` back, surfaced as a blocking conflict notice with the actual expected/current version numbers — not silently clobbered.
- **Read-time truth:** a mitigation's expiry is recomputed live against the clock on every render, never trusted from a stale push.
- **Immutable audit trail:** every mutation's real audit-log entry is fetched from the server and shown per incident, not reconstructed client-side.

## Tech Stack

- **Framework:** React 19 + TypeScript, built with Vite
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` tokens)
- **Animation:** [`motion`](https://motion.dev)
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint (typescript-eslint, react-hooks)

## Setup

### Prerequisites

- Node.js
- The [`post-mortem`](../post-mortem) backend running and reachable (see that repo's README — `docker compose up --build` is the fastest path)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the backend URL

Copy the example env file and point it at your running backend:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base origin of the post-mortem backend, **no path suffix** — e.g. `http://localhost:8000`. This app appends `/api/v1` itself. |

### 3. Run the dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`. On first load you'll land on the sign-in/register screen — self-registration creates a read-only `viewer` account; an existing `admin` has to grant write access via the backend's `PATCH /auth/users/{id}/role`.

### 4. Other scripts

```bash
npm run build    # type-check (tsc -b) then production build
npm run lint      # eslint .
npm run test      # vitest run
npm run preview   # serve the production build locally
```

## Project structure

- `src/components/IncidentDesk/` — the wire-feed dashboard, incident bulletins, and the detail panel that makes the conflict/mitigation/audit-trail mechanics real
- `src/components/Auth/` — sign-in/register
- `src/hooks/useAuth.ts`, `src/hooks/useIncidents.ts` — session and incident-data state, talking to the real backend
- `src/lib/apiClient.ts`, `src/lib/incidentsApi.ts`, `src/lib/authApi.ts` — the backend contract (DTOs match the backend's Pydantic schemas field-for-field)
- `src/lib/incidentMapper.ts` — resolves backend IDs (reporter/assignee/audit actor) to display names via the user directory
