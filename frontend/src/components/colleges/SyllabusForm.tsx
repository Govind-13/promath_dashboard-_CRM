import React from 'react';

interface Unit {
  name: string;
  topics: string;
}

interface Props {
  form: Record<string, unknown>;
  upd: (k: string, v: unknown) => void;
  canEdit: boolean;
}

const SyllabusForm: React.FC<Props> = ({ form, upd, canEdit }) => {
  const units = (form.units as Unit[]) || [];

  const setUnit = (idx: number, key: keyof Unit, val: string) => {
    const next = units.map((u, i) => (i === idx ? { ...u, [key]: val } : u));
    upd('units', next);
  };

  const addUnit = () => upd('units', [...units, { name: '', topics: '' }]);
  const removeUnit = (idx: number) => upd('units', units.filter((_, i) => i !== idx));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="field">
        <label className="label">Subject</label>
        <input className="input" value={(form.subject as string) || ''} onChange={e => upd('subject', e.target.value)} disabled={!canEdit} placeholder="e.g. Engineering Mathematics" />
      </div>
      <div className="field">
        <label className="label">Semester</label>
        <input className="input" value={(form.semester as string) || ''} onChange={e => upd('semester', e.target.value)} disabled={!canEdit} placeholder="e.g. 1-4" />
      </div>
      <div className="field">
        <label className="label">Notes for Content Team</label>
        <textarea className="input" rows={3} value={(form.notes_for_content as string) || ''} onChange={e => upd('notes_for_content', e.target.value)} disabled={!canEdit} placeholder="Any special instructions..." />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="label" style={{ margin: 0 }}>Units ({units.length})</label>
          {canEdit && <button type="button" className="btn btn-secondary" style={{ fontSize: 13, padding: '4px 12px' }} onClick={addUnit}>+ Add Unit</button>}
        </div>
        {units.map((u, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input className="input" value={u.name} onChange={e => setUnit(i, 'name', e.target.value)} disabled={!canEdit} placeholder={`Unit ${i + 1} name`} />
            </div>
            <div style={{ flex: 2 }}>
              <input className="input" value={u.topics} onChange={e => setUnit(i, 'topics', e.target.value)} disabled={!canEdit} placeholder="Topics (comma separated)" />
            </div>
            {canEdit && (
              <button type="button" className="btn-icon" onClick={() => removeUnit(i)} title="Remove unit" style={{ marginTop: 4 }}>🗑️</button>
            )}
          </div>
        ))}
        {units.length === 0 && <div className="empty-state" style={{ padding: 16 }}>No units added yet</div>}
      </div>
    </div>
  );
};

export default SyllabusForm;
