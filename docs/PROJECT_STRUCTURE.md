# Promath CRM Project Structure

This structure follows the uploaded project-structure document, adapted to MongoDB instead of PostgreSQL.

```text
promath dashboard/
├── frontend/
│   ├── public/
│   │   └── icons/
│   └── src/
│       ├── app/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── college/
│       │   ├── billing/
│       │   └── engagement/
│       ├── features/
│       │   ├── auth/
│       │   ├── colleges/
│       │   ├── stages/
│       │   ├── billing/
│       │   ├── engagement/
│       │   ├── usage/
│       │   └── notifications/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── styles/
│       ├── types/
│       └── utils/
├── backend/
│   ├── app/
│   │   ├── config/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   └── utils/
│   │   ├── database/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── colleges/
│   │   │   ├── stages/
│   │   │   ├── syllabus/
│   │   │   ├── coverage/
│   │   │   ├── implementation/
│   │   │   ├── engagement/
│   │   │   ├── usage/
│   │   │   ├── billing/
│   │   │   ├── notifications/
│   │   │   ├── files/
│   │   │   └── reports/
│   │   └── repositories/
│   └── tests/
├── docs/
├── scripts/
├── promath_crm_dashboard_ui_upgraded (16) (1).html
├── server.py
├── requirements.txt
└── .env
```

## Current Status

- Frontend tools are React + TypeScript + Vite, with Tailwind/Zod/React Hook Form/TanStack/Recharts dependencies.
- Backend tools are NestJS + TypeScript + Mongoose for MongoDB.
- The current production-running app is still the single HTML dashboard served by `server.py`.
- MongoDB persistence is active through `/api/storage/:key`.
- The new folders are ready for gradual migration into modular frontend/backend code.

## Migration Order

1. Move shared types into `frontend/src/types`.
2. Split UI pieces from the HTML into `frontend/src/components`.
3. Move CRM API calls into `frontend/src/services`.
4. Move backend storage logic from `server.py` into `backend/src/modules`.
5. Expand NestJS modules for colleges, stages, billing, engagement, notifications, and reports.
