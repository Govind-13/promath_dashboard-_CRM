import React from 'react';
import type { College } from '../../types/college.types';

interface Unit {
  name: string;
  topics: string;
}

interface Props {
  form: Record<string, unknown>;
  upd: (k: string, v: unknown) => void;
  canEdit: boolean;
  college: College;
}

const CoverageForm: React.FC<Props> = ({ form, upd, canEdit, college }) => {
  const syllabusData = college.stages.syllabus_submission?.data || {};
  const units = (syllabusData.units as Unit[]) || [];
  const coverages = (form.unit_coverages as Record<string, number>) || {};
  const notes = (form.unit_notes as Record<string, string>) || {};

  const setCov = (unitName: string, val: number) => {
    const next = { ...coverages, [unitName]: val };
    upd('unit_coverages', next);
    const vals = units.map(u => next[u.name] ?? 0);
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    upd('total_coverage', avg);
  };

  const setNote = (unitName: string, val: string) => {
    upd('unit_notes', { ...notes, [unitName]: val });
  };

  const totalCov = (form.total_coverage as number) ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="label" style={{ margin: 0 }}>Overall Coverage:</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: totalCov >= 80 ? '#2D7A4F' : totalCov >= 50 ? '#B8410A' : '#DC2626' }}>
          {totalCov}%
        </span>
      </div>

      {units.length === 0 && (
        <div className="empty-state" style={{ padding: 16 }}>
          No syllabus units found. Please complete the Syllabus Submission stage first.
        </div>
      )}

      {units.map(u => (
        <div key={u.name} className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>{u.name}</strong>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{u.topics}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label className="label" style={{ margin: 0, fontSize: 13 }}>Coverage %</label>
            <input
              className="input"
              type="number"
              min={0}
              max={100}
              style={{ width: 80 }}
              value={coverages[u.name] ?? 0}
              onChange={e => setCov(u.name, Math.min(100, Math.max(0, Number(e.target.value))))}
              disabled={!canEdit}
            />
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${coverages[u.name] ?? 0}%` }} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <input className="input" placeholder="Notes for this unit..." value={notes[u.name] || ''} onChange={e => setNote(u.name, e.target.value)} disabled={!canEdit} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoverageForm;
