# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Promath CRM — a college sales pipeline dashboard for an education company. Three layers:

1. **Python backend** (`server.py`) — stdlib-only `ThreadingHTTPServer` + `pymongo`. No frameworks.
   - Serves the React production build from `frontend/dist/` at `/`
   - Exposes `GET /api/storage/<key>` and `PUT /api/storage/<key>` for MongoDB persistence
   - Exposes `GET /api/health` for connectivity checks
   - SPA fallback: unknown routes → `index.html` (React handles routing client-side)
   - Falls back to serving the legacy HTML monolith if `frontend/dist/` doesn't exist

2. **React frontend** (`frontend/`) — Vite + TypeScript. The primary UI.
   - State management: React `useState` + `useCallback` in `App.tsx` (no external state library)
   - Storage shim (`utils/storage.ts`): tries `/api/storage/<key>` first, falls back to `localStorage`
   - Two storage keys: `promath_crm_v13` (colleges + notifications), `promath_billing_v2` (quotations + invoices)
   - CSS: vanilla CSS in `styles/globals.css` using CSS variables (no Tailwind in production despite being in package.json)

3. **Legacy HTML monolith** (`promath_crm_dashboard_ui_upgraded (16) (1).html`) — the original prototype. Still works standalone via `localStorage`. Kept as reference/fallback.

## Data model

MongoDB (default `mongodb://localhost:27017`, db `promath_crm`):
- `app_storage` — key/value store; key is unique, value is a JSON string
- `audit_log` — append-only log of every upsert

Stored keys:
- `promath_crm_v13` — `{ colleges: College[], notifications: Notification[] }`
- `promath_billing_v2` — `{ quotations: BillingDoc[], invoices: BillingDoc[], proposals: ProposalDoc[] }`

Types: `frontend/src/types/college.types.ts` and `frontend/src/types/billing.types.ts`.

14-stage pipeline grouped into: Discovery (3), Deal (2), Content (3), Implementation (5), Onboarding (1). Defined in `frontend/src/constants/stages.ts`.

5 roles: admin, content, implementation, engagement, billing. Defined in `frontend/src/constants/roles.ts`. Admin requires password login; others are one-click.

## Running (production)

```powershell
python -m pip install -r requirements.txt   # pymongo
python server.py                            # serves at http://127.0.0.1:8000
```

Open `http://127.0.0.1:8000`. This serves the pre-built React app from `frontend/dist/`.

## Running (development)

```powershell
# Terminal 1: backend
python server.py

# Terminal 2: frontend with hot reload
cd frontend
npm install
npm run dev       # http://localhost:5173, proxies /api → 8000
```

## Rebuilding after frontend changes

```powershell
cd frontend
npm run build     # outputs to frontend/dist/
# Then restart python server.py
```

## Environment variables (also read from `.env`)

```
MONGO_URI=mongodb://localhost:27017
MONGO_DB=promath_crm
MONGO_STORAGE_COLLECTION=app_storage
MONGO_AUDIT_COLLECTION=audit_log
```

## Key design constraints

- `server.py` uses only Python stdlib + `pymongo` — no framework dependencies
- The storage shim must always fall back to `localStorage` when the backend is unavailable
- The React app's `App.tsx` is the single source of truth for state — all data flows down as props
- After any frontend code change, `npm run build` must be re-run for production (port 8000) to reflect changes
- No test suite or linter is configured. Verify changes manually via the running app.
