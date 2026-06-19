# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

Promath CRM — a college sales pipeline dashboard for Promath Technology, an education company. Tracks colleges through a 14-stage sales funnel from initial meeting to student onboarding. Used internally by Sales (Admin), Content, Implementation, Engagement, and Billing teams.

## Architecture

Two layers, no framework on the backend:

```
server.py (Python stdlib HTTPServer + pymongo)
  ├── Serves React build from frontend/dist/ at /
  ├── REST API at /api/*
  └── Falls back to legacy HTML if dist/ missing

frontend/ (React 18 + TypeScript + Vite)
  ├── src/app/App.tsx          ← single state shell, all data flows down as props
  ├── src/components/          ← UI components grouped by feature
  ├── src/constants/           ← stages, roles, engagement config
  ├── src/types/               ← TypeScript interfaces
  ├── src/utils/               ← helpers (college, storage, excel parser)
  └── dist/                    ← production build (committed to git)
```

## Project Structure

```
promath dashboard/
├── server.py                  # Python backend — HTTP server + all API routes
├── requirements.txt           # pymongo only
├── .env                       # MONGO_URI, MONGO_DB (not committed)
├── render.yaml                # Render.com deployment config
├── Procfile                   # Heroku/Render start command
├── Dockerfile                 # Container deployment
│
├── frontend/
│   ├── index.html             # Vite entry HTML
│   ├── package.json           # Dependencies: react, vite, xlsx
│   ├── vite.config.ts         # Dev proxy: /api → localhost:8000
│   ├── tsconfig.json
│   │
│   ├── src/
│   │   ├── main.tsx                        # React entry point
│   │   ├── app/App.tsx                     # Root component — state, routing, persistence
│   │   │
│   │   ├── components/
│   │   │   ├── Login.tsx                   # Role selection + admin password screen
│   │   │   ├── Sidebar.tsx                 # Navigation sidebar
│   │   │   │
│   │   │   ├── colleges/
│   │   │   │   ├── AllColleges.tsx         # College list with search, filters, bulk upload
│   │   │   │   ├── CollegeTable.tsx        # Table with edit/delete per row
│   │   │   │   ├── AddModal.tsx            # Add single college form
│   │   │   │   ├── Detail.tsx              # College detail view with stage timeline
│   │   │   │   ├── StageEditor.tsx         # Edit individual stage data
│   │   │   │   ├── SyllabusForm.tsx        # Syllabus submission form
│   │   │   │   └── CoverageForm.tsx        # Coverage check form
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDash.tsx           # Stats, kanban pipeline, notifications
│   │   │   │   ├── ContentDash.tsx         # Syllabus review queue
│   │   │   │   ├── ImplDash.tsx            # Implementation pipeline
│   │   │   │   ├── BillingDash.tsx         # Quotation/invoice CRUD with GST
│   │   │   │   ├── EngageDash.tsx          # Engagement overview with tabs
│   │   │   │   └── ProposalGenerator.tsx   # Proposal builder with HTML download
│   │   │   │
│   │   │   ├── engagement/
│   │   │   │   ├── JourneyBuilder.tsx      # Automation workflow builder
│   │   │   │   └── UsageTracker.tsx        # Per-college weekly usage logging
│   │   │   │
│   │   │   └── common/
│   │   │       ├── Stat.tsx                # Stat card component
│   │   │       └── TaskCard.tsx            # Task card component
│   │   │
│   │   ├── constants/
│   │   │   ├── stages.ts                   # 14 pipeline stages with groups
│   │   │   ├── roles.ts                    # 5 roles with labels/colors/icons
│   │   │   └── engagement.ts               # Engagement stages, workflow steps, templates
│   │   │
│   │   ├── types/
│   │   │   ├── college.types.ts            # College, StageData, Notification, AppData
│   │   │   └── billing.types.ts            # BillingDoc, LineItem, ProposalDoc
│   │   │
│   │   ├── utils/
│   │   │   ├── storage.ts                  # Storage shim: /api/storage → localStorage fallback
│   │   │   ├── college.ts                  # getStageIdx, getProgress, newCollege, formatDate
│   │   │   └── excel.ts                    # Excel/CSV parser for bulk college upload
│   │   │
│   │   ├── data/sample.ts                  # 10 sample colleges + notifications
│   │   ├── services/api.ts                 # Re-exports storage from utils/storage.ts
│   │   └── styles/globals.css              # All CSS — variables, layout, components
│   │
│   └── dist/                               # Production build (committed for deployment)
│
└── promath_crm_dashboard_ui_upgraded (16) (1).html  # Legacy HTML monolith (reference only)
```

## Data Flow

```
User Action → App.tsx state update → setData() → useEffect persists to storage
                                                      ↓
                                              storage.ts shim
                                                      ↓
                                         /api/storage/<key> (PUT)
                                                      ↓
                                         server.py → MongoDB upsert
                                                      ↓
                                         audit_log entry created
```

On page load: `storage.get("promath_crm_v13")` → if found, parse JSON → if not, use `sampleData()`.

## Database

MongoDB (configurable via env vars):
- **Connection**: `MONGO_URI` (default: `mongodb://localhost:27017`)
- **Database**: `MONGO_DB` (default: `promath_crm`)

Collections:
- `app_storage` — key/value store, key is unique, value is JSON string
- `audit_log` — append-only log of every upsert

Storage keys:
- `promath_crm_v13` — `{ colleges: College[], notifications: Notification[] }`
- `promath_billing_v2` — `{ quotations: BillingDoc[], invoices: BillingDoc[], proposals: ProposalDoc[] }`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | MongoDB connectivity check |
| GET | `/api/colleges` | List all colleges |
| POST | `/api/colleges` | Add one college |
| POST | `/api/colleges/bulk` | Bulk import (deduplicates by name) |
| PATCH | `/api/colleges/:id` | Update college fields |
| DELETE | `/api/colleges/:id` | Delete a college |
| GET | `/api/storage/:key` | Read stored JSON by key |
| PUT | `/api/storage/:key` | Upsert stored JSON by key |

## 14-Stage Sales Pipeline

Grouped into 5 phases:

| Phase | Stages | Team |
|-------|--------|------|
| **Discovery** (3) | Initial Meeting → Product Demo → Demo Follow-up | Admin |
| **Deal** (2) | Pricing Negotiation → MOU Signing | Admin |
| **Content** (3) | Syllabus Submission → Coverage Check → Coverage Communication | Admin + Content |
| **Implementation** (5) | Student Data → License Creation → Impl Confirmation → Implementation → Impl Feedback | Implementation + Engagement |
| **Onboarding** (1) | Orientation | Engagement |

Each college has a `stages` record: `{ [stage_id]: { status, completed_at, data } }`.

## 5 User Roles

| Role | Access | Dashboard |
|------|--------|-----------|
| **admin** | Full access, all colleges, all stages | Stats + kanban + notifications |
| **content** | Colleges with syllabus submitted | Syllabus review queue |
| **implementation** | Colleges in implementation stages | 5-section pipeline |
| **engagement** | Colleges in feedback/orientation | Tabs: overview, pipeline, actions, journey, usage |
| **billing** | Separate billing module | Quotation/invoice CRUD with GST |

All roles authenticate through the backend using email/password and JWT. The
authenticated user's backend role controls dashboard and API permissions.

## Key Features

- **College CRUD**: Add, edit name inline, delete with confirmation (click twice)
- **Excel Bulk Upload**: Upload `.xlsx`/`.csv` files; auto-maps columns (name, contact, phone, email, location, students)
- **Stage Tracking**: Click any college → Detail view → edit each stage's status and data
- **Billing**: Quotations and invoices with line items, GST calculation, HTML download
- **Proposals**: Auto-prefill from pricing stage, feature checkboxes, HTML download
- **Engagement**: Journey automation builder, weekly usage tracking per college
- **Notifications**: Role-based, mark as read
- **Storage Fallback**: If backend/MongoDB unavailable, falls back to `localStorage`

## Running Locally

### Production mode (recommended)
```powershell
pip install -r requirements.txt
python server.py                    # http://127.0.0.1:8000
```
Serves the pre-built React app from `frontend/dist/`.

### Development mode (hot reload)
```powershell
# Terminal 1: backend
python server.py                    # port 8000

# Terminal 2: frontend
cd frontend
npm install
npm run dev                         # port 5173, proxies /api → 8000
```

### After frontend code changes
```powershell
cd frontend
npm run build                       # rebuilds dist/
# Restart server.py or just refresh browser (port 8000)
```

## Deployment (Render.com)

Already configured in `render.yaml` and `Procfile`:
1. Connect GitHub repo on [render.com](https://render.com)
2. Set environment variable: `MONGO_URI` = MongoDB Atlas connection string
3. Auto-deploys on every push to `main`

Live URL: `https://promath-dashboard-crm.onrender.com`

For MongoDB: use [MongoDB Atlas](https://cloud.mongodb.com) free tier (M0, 512MB).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGO_DB` | `promath_crm` | Database name |
| `MONGO_STORAGE_COLLECTION` | `app_storage` | Key-value collection |
| `MONGO_AUDIT_COLLECTION` | `audit_log` | Audit log collection |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port (Render sets this automatically) |

## Key Design Constraints

- `server.py` uses only Python stdlib + `pymongo` — no Flask/Django/FastAPI
- The storage shim (`utils/storage.ts`) must always fall back to `localStorage` when backend is unavailable
- `App.tsx` is the single source of truth for state — all data flows down as props, no external state library
- After any frontend code change, `npm run build` must be re-run for production to reflect changes
- `frontend/dist/` is committed to git so deployment works without a Node.js build step on the server
- No test suite or linter is configured — verify changes manually via the running app
- CSS is vanilla CSS with CSS variables in `globals.css` (no Tailwind in production)
