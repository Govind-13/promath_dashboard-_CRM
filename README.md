# Promath CRM

Promath CRM is a role-based college sales and implementation dashboard.

## Architecture

- React + TypeScript + Vite: production user interface
- NestJS + TypeScript: primary CRM and authentication API
- MongoDB Atlas: application database
- Python `server.py`: compatibility web server that serves the React build and
  retains legacy storage/migration support

The React application uses normalized NestJS APIs. It does not load or save the
legacy `promath_crm_v13` or `promath_billing_v2` blobs.

## MongoDB Collections

```text
users
colleges
stageUpdates
billingProposals
notifications
excelImports
migrationLogs
app_storage
audit_log
```

`app_storage` remains only for legacy backup and migration.

## Environment

Create `.env` from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Required production values:

```text
MONGODB_URI
MONGO_DB
JWT_SECRET
JWT_EXPIRES_IN
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME
CORS_ORIGINS
NEST_API_URL
```

`JWT_SECRET` must be at least 32 characters in production. Never commit `.env`.

Frontend configuration is documented in `frontend/.env.example`:

```text
VITE_API_BASE_URL=http://127.0.0.1:4000
VITE_ENABLE_LOCAL_FALLBACK=false
```

Production CRM data never silently falls back to localStorage. The token remains
in localStorage for the current release.

## MongoDB Atlas

1. Create a database user with a strong password.
2. Allow the deployment service IP/network in Atlas Network Access.
3. Set `MONGODB_URI` to the Atlas connection string.
4. Set `MONGO_DB=promath_crm`.
5. Rotate credentials immediately if they are exposed in chat, logs, or source.

## Default Admin

On NestJS startup, the configured admin is created when that email does not
already exist. Changing `ADMIN_EMAIL` can therefore seed an additional admin
without removing existing admins:

```text
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<strong password>
ADMIN_NAME=<display name>
```

Passwords are stored as bcrypt hashes. Production credentials are not
hardcoded.

## Local Setup

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

NestJS API:

```powershell
cd backend
npm ci
npm run dev
```

Default URLs:

```text
Frontend: http://127.0.0.1:5173
Nest API: http://127.0.0.1:4000
```

The Vite dev server proxies API routes to port `4000`.

## Production Builds

```powershell
cd frontend
npm run build

cd ../backend
npm run build
```

Start the compiled Nest API:

```powershell
cd backend
npm start
```

Start the compatibility React web server:

```powershell
python server.py
```

## Testing

```powershell
cd backend
npm run build
npm test

cd ../frontend
npm run build
npm test
```

Backend tests cover authentication, `/auth/me`, admin user creation, role
permissions, college CRUD, stale update conflicts, stage updates, billing
proposal CRUD, notification CRUD, Excel imports, CORS, migration, environment
validation, and deprecated storage headers.

Frontend safety tests verify normalized API usage, authentication/logout wiring,
role visibility rules, and absence of production blob/localStorage CRM fallback.

There is currently no browser automation framework or lint script configured.
Excel import supports `.xlsx` and `.csv` files up to 10 MB and 5,000 rows.

## Deployment

`render.yaml` defines two services:

1. `promath-crm-web`: builds React and serves it through the compatibility Python
   web server.
2. `promath-crm-api`: runs the production NestJS API.

Set `NEST_API_URL` on the web service to the public URL of
`promath-crm-api`. Set `CORS_ORIGINS` on the API service to the public web URL.

The backend Docker image is a multi-stage Node build and runs with
`NODE_ENV=production`.

## Migration

The original blobs are retained:

```text
promath_crm_v13
promath_billing_v2
```

Migrate without deleting them:

```powershell
cd backend
npm run build
npm run migrate:storage
```

The migration avoids duplicate colleges using name, email, and phone matching
and writes a summary to `migrationLogs`.

## Legacy Status

| File or feature | Status | Decision |
| --- | --- | --- |
| `server.py` | Used to serve React and runtime API config | Keep |
| Legacy HTML dashboard | Python fallback only | Archive after React deployment is proven |
| `backend/app/` Python wrappers | Not used by primary Nest API | Safe to archive later |
| `/api/storage/:key` | Admin-only backup/migration compatibility | Keep temporarily; deprecated |
| `promath_crm_v13` / `promath_billing_v2` | Not used by React | Keep until migration verification and backup approval |
| `frontend/src/utils/storage.ts` | Unused compatibility helper | Safe to delete later with legacy storage removal |
| `frontend/src/components/LegacyRoleSelect.tsx` | Not used in production flow | Safe to archive later |
| Root `Procfile` | Legacy Python hosting fallback | Archive after Docker-only deployment is confirmed |

Do not delete legacy files or blob data until deployment, migration counts, and
backups have been independently verified.
