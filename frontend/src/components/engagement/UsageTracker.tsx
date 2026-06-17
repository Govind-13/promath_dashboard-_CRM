import React, { useState } from 'react';
import type { AppData, College } from '../../types/college.types';

interface UsageEntry {
  week: string;
  active_students: number;
  avg_minutes: number;
  quizzes_attempted: number;
  notes: string;
}

interface Props {
  data: AppData;
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

const UsageTracker: React.FC<Props> = ({ data, updateCollege }) => {
  const [selectedId, setSelectedId] = useState('');

  const engagedColleges = data.colleges.filter(c =>
    c.stages.implementation?.status === 'completed' || c.stages.orientation?.status !== 'not_started'
  );

  const college = engagedColleges.find(c => c.id === selectedId);
  const usageData = (college?.stages.orientation?.data?.usage_log as UsageEntry[]) || [];

  const [entry, setEntry] = useState<UsageEntry>({
    week: new Date().toISOString().slice(0, 10),
    active_students: 0,
    avg_minutes: 0,
    quizzes_attempted: 0,
    notes: '',
  });

  const addEntry = () => {
    if (!selectedId) return;
    updateCollege(selectedId, c => {
      const sd = c.stages.orientation || { status: 'in_progress', completed_at: null, data: {} };
      const log = (sd.data.usage_log as UsageEntry[]) || [];
      return {
        ...c,
        stages: {
          ...c.stages,
          orientation: { ...sd, data: { ...sd.data, usage_log: [...log, entry] } },
        },
      };
    });
    setEntry({ week: new Date().toISOString().slice(0, 10), active_students: 0, avg_minutes: 0, quizzes_attempted: 0, notes: '' });
  };

  return (
    <div>
      <h3>Weekly Usage Tracker</h3>
      <p style={{ color: '#6B7280', marginBottom: 16 }}>Log weekly usage metrics per college</p>

      <div className="field" style={{ marginBottom: 20 }}>
        <label className="label">Select College</label>
        <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">Choose a college...</option>
          {engagedColleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedId && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 12 }}>Add Usage Entry</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
              <div className="field">
                <label className="label">Week of</label>
                <input className="input" type="date" value={entry.week} onChange={e => setEntry({ ...entry, week: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Active Students</label>
                <input className="input" type="number" value={entry.active_students} onChange={e => setEntry({ ...entry, active_students: Number(e.target.value) })} />
              </div>
              <div className="field">
                <label className="label">Avg Minutes</label>
                <input className="input" type="number" value={entry.avg_minutes} onChange={e => setEntry({ ...entry, avg_minutes: Number(e.target.value) })} />
              </div>
              <div className="field">
                <label className="label">Quizzes</label>
                <input className="input" type="number" value={entry.quizzes_attempted} onChange={e => setEntry({ ...entry, quizzes_attempted: Number(e.target.value) })} />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label className="label">Notes</label>
              <input className="input" value={entry.notes} onChange={e => setEntry({ ...entry, notes: e.target.value })} placeholder="Any observations..." />
            </div>
            <button className="btn btn-primary" onClick={addEntry}>Add Entry</button>
          </div>

          <h4>Usage History ({usageData.length} entries)</h4>
          {usageData.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>No usage data logged yet</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Active Students</th>
                  <th>Avg Minutes</th>
                  <th>Quizzes</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {usageData.map((u, i) => (
                  <tr key={i}>
                    <td>{u.week}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{u.active_students}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{u.avg_minutes}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{u.quizzes_attempted}</td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{u.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default UsageTracker;
