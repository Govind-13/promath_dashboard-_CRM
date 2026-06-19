FROM node:20-slim AS frontend-build

WORKDIR /frontend

ARG VITE_API_BASE_URL
ARG VITE_ENABLE_LOCAL_FALLBACK=false
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ENABLE_LOCAL_FALLBACK=${VITE_ENABLE_LOCAL_FALLBACK}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV APP_ENV=production

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .
COPY "promath_crm_dashboard_ui_upgraded (16) (1).html" .
COPY --from=frontend-build /frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["python", "server.py"]
