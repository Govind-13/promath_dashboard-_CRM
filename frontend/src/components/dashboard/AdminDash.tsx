import React from 'react';
import type { AppData, College, Notification } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import { getStageIdx, getProgress, formatDate, greeting } from '../../utils/college';

interface Props {
  data: AppData;
  onSelect: (id: string) => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
  markNotifRead: (id: string) => void;
}

const AdminDash: React.FC<Props> = ({ data, onSelect, updateCollege: _, markNotifRead }) => {
  const colleges = data.colleges;
  const totalValue = colleges.reduce((sum, c) => {
    const val = Number(c.stages.pricing_negotiation?.data?.total_value) || 0;
    return sum + val;
  }, 0);
  const completed = colleges.filter(c => getProgress(c) === 100).length;
  const inProgress = colleges.filter(c => { const p = getProgress(c); return p > 0 && p < 100; }).length;
  const notStarted = colleges.filter(c => getProgress(c) === 0).length;

  const kanbanGroups = ['Discovery', 'Deal', 'Content', 'Implementation', 'Onboarding'];
  const kanbanData = kanbanGroups.map(group => {
    const stageIds = STAGES.filter(s => s.group === group).map(s => s.id);
    const groupColleges = colleges.filter(c => {
      const idx = getStageIdx(c);
      return stageIds.includes(STAGES[idx].id);
    });
    return { group, colleges: groupColleges };
  });

  const unreadNotifs = data.notifications.filter(n => n.role === 'admin' && !n.read);
  const recentColleges = [...colleges].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return (
    <div className="fade-in">
      <h2>{greeting()}, Harsha</h2>
      <p style={{ color: '#6B7280', marginTop: -8, marginBottom: 24 }}>Here is your pipeline overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Total Colleges</div>
          <div className="stat-value">{colleges.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pipeline Value</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {totalValue >= 100000 ? `${(totalValue / 100000).toFixed(1)}L` : totalValue.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgress}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{completed} done, {notStarted} new</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Notifications</div>
          <div className="stat-value">{unreadNotifs.length}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>unread</div>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Pipeline Kanban</h3>
      <div className="kanban" style={{ marginBottom: 32 }}>
        {kanbanData.map(({ group, colleges: gc }) => (
          <div key={group} className="kanban-column">
            <div className="kanban-header">
              {group} <span style={{ opacity: 0.6 }}>({gc.length})</span>
            </div>
            {gc.length === 0 && <div style={{ padding: 12, color: '#9CA3AF', fontSize: 13 }}>No colleges</div>}
            {gc.map(c => (
              <div key={c.id} className="task-card" onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{c.location} | {c.contact_name}</div>
                <div className="progress-bar" style={{ marginTop: 6 }}>
                  <div className="progress-fill" style={{ width: `${getProgress(c)}%` }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {unreadNotifs.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12 }}>Notifications</h3>
          <div style={{ marginBottom: 32 }}>
            {unreadNotifs.map(n => (
              <div key={n.id} className="notif" onClick={() => markNotifRead(n.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{formatDate(n.timestamp)}</div>
                </div>
                <button className="btn-icon" title="Mark read">✓</button>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 style={{ marginBottom: 12 }}>Recent Activity</h3>
      <table className="table">
        <thead>
          <tr>
            <th>COLLEGE</th>
            <th>TYPE</th>
            <th>LOCATION</th>
            <th>STUDENTS</th>
            <th>ADDED</th>
          </tr>
        </thead>
        <tbody>
          {recentColleges.map(c => (
            <tr key={c.id} onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
              <td><strong>{c.name}</strong></td>
              <td>{c.college_type}</td>
              <td>{c.location}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{c.total_students}</td>
              <td style={{ fontSize: 13, color: '#6B7280' }}>{formatDate(c.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDash;
