import React, { useState } from 'react';
import type { College } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import { getStageIdx, getProgress } from '../../utils/college';

interface Props {
  colleges: College[];
  onSelect: (id: string) => void;
  updateCollege?: (id: string, fn: (c: College) => College) => void;
}

const CollegeTable: React.FC<Props> = ({ colleges, onSelect, updateCollege }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (c: College, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditValue(c.name);
  };

  const saveEdit = (id: string) => {
    if (updateCollege && editValue.trim()) {
      updateCollege(id, c => ({ ...c, name: editValue.trim() }));
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>COLLEGE</th>
          <th>CONTACT</th>
          <th>CURRENT STAGE</th>
          <th>PROGRESS</th>
        </tr>
      </thead>
      <tbody>
        {colleges.map(c => {
          const idx = getStageIdx(c);
          const stage = STAGES[idx];
          const pct = getProgress(c);
          return (
            <tr key={c.id} onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
              <td>
                {editingId === c.id ? (
                  <input
                    className="input"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(c.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{c.name}</strong>
                    {updateCollege && (
                      <button className="btn-icon" onClick={e => startEdit(c, e)} title="Edit name">✏️</button>
                    )}
                  </span>
                )}
              </td>
              <td>
                <div>{c.contact_name}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{c.contact_designation}</div>
              </td>
              <td>
                <span className="pill" style={{ background: stage.group === 'Discovery' ? '#EEF4FF' : stage.group === 'Deal' ? '#FDF4ED' : stage.group === 'Content' ? '#F2EDFB' : stage.group === 'Implementation' ? '#E8F3EC' : '#ECFDF5' }}>
                  {stage.icon} {stage.label}
                </span>
              </td>
              <td style={{ minWidth: 140 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#6B7280' }}>{pct}%</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CollegeTable;
