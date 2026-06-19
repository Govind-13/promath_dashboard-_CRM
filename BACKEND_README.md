# Backend Compatibility Note

The primary CRM backend is the NestJS application in `backend/`.

The root `server.py` is retained temporarily to:

- serve the production React build;
- expose runtime frontend configuration;
- preserve admin-only legacy storage backup/migration endpoints;
- provide the legacy HTML fallback.

For current setup, testing, deployment, and cleanup status, see `README.md`.
