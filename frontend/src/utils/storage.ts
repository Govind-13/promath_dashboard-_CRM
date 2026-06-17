export const storage = {
  async get(key: string): Promise<{ value: string } | null> {
    try {
      const res = await fetch('/api/storage/' + encodeURIComponent(key));
      if (!res.ok) throw new Error('Storage API failed');
      const data = await res.json();
      return { value: data.value };
    } catch (e) {
      console.warn('Storage API unavailable, using localStorage.', e);
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      const res = await fetch('/api/storage/' + encodeURIComponent(key), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error('Storage API failed');
    } catch (e) {
      console.warn('Storage API unavailable, using localStorage.', e);
      localStorage.setItem(key, value);
    }
  },
};
