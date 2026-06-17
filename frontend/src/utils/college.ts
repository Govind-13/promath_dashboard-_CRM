import { STAGES } from '../constants/stages';
import type { College, StageData } from '../types/college.types';

export const getStageIdx = (c: College): number => {
  const idx = STAGES.findIndex(s => {
    const sd = c.stages[s.id];
    return !sd || sd.status !== 'completed';
  });
  return idx === -1 ? STAGES.length - 1 : idx;
};

export const getProgress = (c: College): number => {
  const done = STAGES.filter(s => c.stages[s.id]?.status === 'completed').length;
  return Math.round((done / STAGES.length) * 100);
};

export const newCollege = (data: Partial<College>): College => {
  const stages: Record<string, StageData> = {};
  STAGES.forEach(s => { stages[s.id] = { status: 'not_started', completed_at: null, data: {} }; });
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    name: '', college_type: '', academic_year: '', contact_name: '', contact_designation: '',
    phone: '', email: '', location: '', total_students: '',
    created_at: new Date().toISOString(), stages,
    ...data,
  };
};

export const formatDate = (iso?: string | null): string => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
