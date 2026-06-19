import { clearAuthToken, getAuthToken } from '../services/authToken';
import { localFallbackEnabled } from '../api/client';

// Legacy backup helper retained temporarily. Active CRM screens use normalized API modules.
export const storage = {
  async get(key: string): Promise<{ value: string } | null> {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const res = await fetch('/api/storage/' + encodeURIComponent(key), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        clearAuthToken();
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Storage API failed');
      const data = await res.json();
      return { value: data.value };
    } catch (e) {
      if (e instanceof Error && e.message === 'Unauthorized') throw e;
      if (!localFallbackEnabled) throw e;
      console.warn('Storage API unavailable, using development localStorage fallback.', e);
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch('/api/storage/' + encodeURIComponent(key), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value }),
      });
      if (res.status === 401 || res.status === 403) {
        clearAuthToken();
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Storage API failed');
    } catch (e) {
      if (e instanceof Error && e.message === 'Unauthorized') throw e;
      if (!localFallbackEnabled) throw e;
      console.warn('Storage API unavailable, using development localStorage fallback.', e);
      localStorage.setItem(key, value);
    }
  },
};
