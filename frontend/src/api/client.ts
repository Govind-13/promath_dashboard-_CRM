import { clearAuthToken, getAuthToken } from '../services/authToken';

let runtimeApiBase: Promise<string> | null = null;

async function getApiBaseUrl() {
  const buildTimeUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  if (buildTimeUrl) return buildTimeUrl;
  if (import.meta.env.DEV) return '';
  if (!runtimeApiBase) {
    runtimeApiBase = fetch('/api/frontend-config')
      .then(response => response.ok ? response.json() : { apiBaseUrl: '' })
      .then(config => String(config.apiBaseUrl || '').replace(/\/$/, ''))
      .catch(() => '');
  }
  return runtimeApiBase;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const isConflictError = (error: unknown) =>
  error instanceof ApiError && (error.status === 409 || error.code === 'version_conflict');

export async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    const apiBaseUrl = await getApiBaseUrl();
    response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Unable to reach the backend. Please check the server and try again.', 0, 'network_error');
  }

  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    clearAuthToken();
    window.dispatchEvent(new CustomEvent('promath:unauthorized'));
  }
  if (!response.ok) {
    const rawMessage = body?.message;
    const message =
      Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : typeof rawMessage === 'string'
          ? rawMessage
        : body?.error === 'version_conflict'
          ? 'This record was updated by another user. Please refresh before saving.'
          : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, body?.error, body);
  }
  return body as T;
}

export const localFallbackEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOCAL_FALLBACK === 'true';
