# Promath CRM Tools

This is the tool stack from the project document, changed to use MongoDB.

| Area | Tool |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui-compatible component folders |
| Forms | React Hook Form |
| Validation | Zod |
| Tables | TanStack Table |
| Server State | TanStack Query |
| Client State | Zustand |
| Charts | Recharts |
| Backend | NestJS + Node.js + TypeScript |
| Database | MongoDB Atlas |
| Mongo ODM | Mongoose |
| Current Runtime Backend | Python `server.py` until NestJS migration is complete |

## MongoDB Collections

- `app_storage`
- `audit_log`
- future: `users`, `roles`, `colleges`, `college_contacts`, `college_stage_status`, `billing_documents`, `notifications`
