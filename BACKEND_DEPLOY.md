# Deploy

This project deploys React and NestJS as separate services. The compatibility
Python web service serves the React build and retains legacy backup/migration
support. NestJS is the primary CRM API.

## Required Environment Variables

Set these on the hosting platform:

```text
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/promath_crm?appName=CRM
MONGO_DB=promath_crm
HOST=0.0.0.0
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=8h
CORS_ORIGINS=<public-react-web-url>
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
ADMIN_NAME=<admin-name>
VITE_API_BASE_URL=<public-nestjs-backend-url>
NEST_API_URL=<public-nestjs-backend-url>
```

Most platforms set `PORT` automatically.
`MONGODB_URI` is preferred; `MONGO_URI` remains supported for older
deployments. On first backend start, the app creates an admin user from
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` if no admin exists.

The React production build uses `VITE_API_BASE_URL` for normalized NestJS APIs.
If that build-time value is empty, the Python frontend server exposes
`/api/frontend-config` and supplies `NEST_API_URL` at runtime.
Local Vite development proxies auth, colleges, stages, billing, notifications,
imports, users, and legacy storage requests to `http://127.0.0.1:4000`.
`VITE_ENABLE_LOCAL_FALLBACK` defaults to `false`; production API failures are
shown to the user and are not silently written to localStorage.

## Render

Use `render.yaml`. It creates:

```text
promath-crm-web: React build served by compatibility Python web server
promath-crm-api: NestJS API connected to MongoDB
```

## Docker

```powershell
docker build -t promath-crm-backend .
docker run -p 8000:8000 --env-file .env promath-crm-backend
```

The Docker image performs these steps:

1. Install frontend dependencies with `npm ci`.
2. Build React with `npm run build`.
3. Install Python backend dependencies.
4. Copy `frontend/dist` into the runtime image.
5. Start `python server.py`.

At runtime, `/` and frontend routes serve the React build from
`frontend/dist/index.html`. Existing API routes such as `/api/storage/:key`
continue to be handled by `server.py`.

## Authentication

The active Python runtime now exposes:

```text
POST   /auth/login
GET    /auth/me
POST   /users
GET    /users
PATCH  /users/:id
DELETE /users/:id
```

`/auth/login` returns a JWT access token. `/auth/me`, `/users`, and CRM API
routes require `Authorization: Bearer <token>`. User management is admin-only.
`DELETE /api/colleges/:id` is also admin-only; the other college/storage routes
require any active authenticated user for now.

## Phase 3 Collections

The NestJS backend now defines normalized collections for new CRM APIs:

```text
users
colleges
stageUpdates
billingProposals
notifications
excelImports
migrationLogs
```

The legacy blob storage keys are still preserved and `/api/storage/:key`
continues to work for backward compatibility:

```text
promath_crm_v13
promath_billing_v2
```

To migrate old blob data into normalized collections without deleting the old
blob records:

```powershell
cd backend
npm run build
npm run migrate:storage
```

The migration can also be triggered by an authenticated admin through:

```text
POST /imports/migrate-storage
```

It returns a summary with colleges, stages, billing proposals, notifications,
skipped records, and failures.

## API Endpoints

```text
GET    /api/health
GET    /api/colleges
POST   /api/colleges
PATCH  /api/colleges/:id
DELETE /api/colleges/:id
POST   /api/colleges/bulk
GET    /api/storage/:key
PUT    /api/storage/:key
```
