import React, { useState } from 'react';
import type { College } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import { getStageIdx, getProgress } from '../../utils/college';

interface Props {
  colleges: College[];
  onSelect: (id: string) => void;
  updateCollege?: (id: string, fn: (c: College) => College) => void;
  onDelete?: (id: string) => void;
}

const CollegeTable: React.FC<Props> = ({ colleges, onSelect, updateCollege, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDelete?.(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="table-wrap"><table className="table">
      <thead>
        <tr>
          <th>COLLEGE</th>
          <th>CONTACT</th>
          <th>CURRENT STAGE</th>
          <th>PROGRESS</th>
          {onDelete && <th style={{ width: 60 }}>ACTION</th>}
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
              {onDelete && (
                <td>
                  <button
                    className="btn-icon"
                    onClick={e => handleDelete(c.id, e)}
                    title={confirmDeleteId === c.id ? 'Click again to confirm' : 'Delete college'}
                    style={{ color: confirmDeleteId === c.id ? '#DC2626' : '#6B7280', fontSize: confirmDeleteId === c.id ? 14 : 16 }}
                  >
                    {confirmDeleteId === c.id ? '⚠️ Sure?' : '🗑️'}
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table></div>
  );
};

export default CollegeTable;
