# Promath CRM Backend

This dashboard now has a small Python backend with MongoDB persistence.

## Install

```powershell
python -m pip install -r requirements.txt
```

MongoDB should be running locally, or set `MONGO_URI` for MongoDB Atlas.
The server also reads environment values from a local `.env` file.

## Run

```powershell
python server.py 8000
```

Open:

```text
http://127.0.0.1:8000
```

## Database

Default connection:

```text
MONGO_URI=mongodb://localhost:27017
MONGO_DB=promath_crm
```

Collections:

- `app_storage`
- `audit_log`

Stored keys:

- `promath_crm_v13` - main CRM colleges, stages, notifications, usage, journeys
- `promath_billing_v2` - quotations, invoices, proposals

If the HTML file is opened directly without the backend, it still falls back to browser `localStorage`.
