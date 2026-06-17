import React from 'react';
import type { AppData } from '../../types/college.types';
import { greeting, formatDate } from '../../utils/college';

interface Props {
  data: AppData;
  onSelect: (id: string) => void;
}

const ImplDash: React.FC<Props> = ({ data, onSelect }) => {
  const colleges = data.colleges;

  const studentData = colleges.filter(c =>
    c.stages.coverage_communication?.status === 'completed' &&
    c.stages.student_data?.status !== 'completed'
  );
  const licensing = colleges.filter(c =>
    c.stages.student_data?.status === 'completed' &&
    c.stages.license_creation?.status !== 'completed'
  );
  const confirmation = colleges.filter(c =>
    c.stages.license_creation?.status === 'completed' &&
    c.stages.impl_confirmation?.status !== 'completed'
  );
  const implementing = colleges.filter(c =>
    c.stages.impl_confirmation?.status === 'completed' &&
    c.stages.implementation?.status !== 'completed'
  );
  const completed = colleges.filter(c =>
    c.stages.implementation?.status === 'completed'
  );

  const implNotifs = data.notifications.filter(n => n.role === 'implementation' && !n.read);

  const sections = [
    { title: 'Student Data Collection', emoji: '📊', items: studentData, color: '#B8410A' },
    { title: 'License Creation', emoji: '🔑', items: licensing, color: '#6B46C1' },
    { title: 'Confirmation Pending', emoji: '📅', items: confirmation, color: '#175CD3' },
    { title: 'Implementation Active', emoji: '⚡', items: implementing, color: '#0E7490' },
    { title: 'Completed', emoji: '✅', items: completed, color: '#2D7A4F' },
  ];

  return (
    <div className="fade-in">
      <h2>{greeting()}, Implementation Team</h2>
      <p style={{ color: '#6B7280', marginTop: -8, marginBottom: 24 }}>Student data, licensing, and deployment</p>

      {implNotifs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {implNotifs.map(n => (
            <div key={n.id} className="notif">
              <span>{n.message}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{formatDate(n.timestamp)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
        {sections.map(s => (
          <div key={s.title} className="stat-card">
            <div className="stat-label">{s.emoji} {s.title}</div>
            <div className="stat-value">{s.items.length}</div>
          </div>
        ))}
      </div>

      {sections.map(s => (
        <div key={s.title} style={{ marginBottom: 28 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {s.emoji} {s.title}
            <span className="pill" style={{ background: s.color, color: '#fff' }}>{s.items.length}</span>
          </h3>
          {s.items.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>No colleges in this stage</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {s.items.map(c => {
                const licData = c.stages.license_creation?.data || {};
                const total = Number(licData.total_licenses) || 0;
                const created = Number(licData.licenses_created) || 0;
                const licPct = total > 0 ? Math.round((created / total) * 100) : 0;
                return (
                  <div key={c.id} className="card" onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: 13, color: '#6B7280' }}>{c.location} | {c.total_students} students</div>
                      </div>
                      {total > 0 && (
                        <div style={{ textAlign: 'right', fontSize: 12 }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{created}/{total}</span> licenses
                          <div className="progress-bar" style={{ width: 100, marginTop: 4 }}>
                            <div className="progress-fill" style={{ width: `${licPct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImplDash;
