import React, { useState } from 'react';
import { College } from '../../types';
import { STAGES } from '../../constants';

interface CollegeTableProps {
  colleges: College[];
  onSelect: (id: string) => void;
  updateCollege?: (id: string, fn: (c: College) => College) => void;
}

const getStageIdx = (c: College) => {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (c.stages[STAGES[i].id]?.status === 'completed') idx = i + 1;
    else break;
  }
  return Math.min(idx, STAGES.length - 1);
};

const getProgress = (c: College) => {
  const done = STAGES.filter(s => c.stages[s.id]?.status === 'completed').length;
  return Math.round((done / STAGES.length) * 100);
};

export const CollegeTable: React.FC<CollegeTableProps> = ({ colleges, onSelect, updateCollege }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEdit = (e: React.MouseEvent, c: College) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditName(c.name);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (updateCollege && editName.trim() && editingId) {
      updateCollege(editingId, c => ({ ...c, name: editName.trim() }));
    }
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="table-wrap overflow-x-auto border border-[var(--border-soft)] rounded-2xl">
      <table className="w-full border-collapse text-[13px] bg-white text-[var(--ink)]">
        <thead>
          <tr className="bg-[var(--surface-alt)]">
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">College</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">Contact</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">Current Stage</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">Progress</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]"></th>
          </tr>
        </thead>
        <tbody>
          {colleges.map(c => {
            const stage = STAGES[getStageIdx(c)];
            const p = getProgress(c);
            return (
              <tr key={c.id} className="row cursor-pointer transition-colors duration-150 hover:bg-[var(--surface-alt)] border-b border-[var(--border-soft)]" onClick={() => onSelect(c.id)}>
                <td className="py-4 px-4 font-normal">
                  {editingId === c.id ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <input 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (updateCollege && editName.trim() && editingId) {
                              updateCollege(editingId, college => ({ ...college, name: editName.trim() }));
                            }
                            setEditingId(null);
                          }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="py-1 px-2 text-sm font-medium rounded border border-[var(--accent)] bg-white text-[var(--ink)] outline-none w-full"
                        autoFocus 
                      />
                      <button onClick={saveEdit} className="py-1 px-2 text-[11px] font-semibold text-white bg-[var(--accent)] rounded hover:bg-opacity-90 cursor-pointer">✓</button>
                      <button onClick={cancelEdit} className="py-1 px-2 text-[11px] font-semibold text-[var(--muted)] bg-white border border-[var(--border)] rounded hover:bg-gray-50 cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="font-semibold text-[var(--ink)] truncate max-w-[280px] lg:max-w-xs">{c.name}</div>
                      {updateCollege && (
                        <button 
                          onClick={e => startEdit(e, c)} 
                          className="p-1 rounded hover:bg-[var(--border)] opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-150 text-xs text-[var(--muted)]"
                          title="Rename college"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  )}
                  <div className="text-[11px] text-[var(--muted)] mt-1">{c.location || 'No Location'} · {c.total_students || '?'} students</div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium">{c.contact_name || 'No direct contact'}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">{c.contact_designation || 'Staff'}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="pill inline-flex items-center gap-1.5 bg-[#F2F4F7] text-[#344054] px-2.5 py-1 rounded-full text-[11px] font-medium border border-[var(--border-soft)]">
                    {stage?.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="progress-bar w-[92px] h-[7px] bg-gray-200 rounded-full overflow-hidden inline-block align-middle">
                      <span className="progress-fill h-full block rounded-full transition-all duration-300 bg-gradient-to-r from-[var(--accent)] to-[#2E90FA]" style={{ width: p + '%' }}></span>
                    </span>
                    <span className="mono text-[11px] text-[var(--muted)] font-mono">{p}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-gray-400">
                  <span>›</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
