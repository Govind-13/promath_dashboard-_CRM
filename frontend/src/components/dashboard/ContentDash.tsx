import React from 'react';
import type { AppData } from '../../types/college.types';
import { greeting, formatDate } from '../../utils/college';

interface Props {
  data: AppData;
  onSelect: (id: string) => void;
}

const ContentDash: React.FC<Props> = ({ data, onSelect }) => {
  const colleges = data.colleges;

  const pending = colleges.filter(c =>
    c.stages.syllabus_submission?.status === 'completed' &&
    c.stages.coverage_check?.status === 'not_started'
  );
  const inReview = colleges.filter(c =>
    c.stages.coverage_check?.status === 'in_progress'
  );
  const done = colleges.filter(c =>
    c.stages.coverage_check?.status === 'completed'
  );

  const contentNotifs = data.notifications.filter(n => n.role === 'content' && !n.read);

  const Section: React.FC<{ title: string; emoji: string; items: typeof colleges; color: string }> = ({ title, emoji, items, color }) => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{emoji}</span> {title}
        <span className="pill" style={{ background: color, color: '#fff', marginLeft: 8 }}>{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: 24 }}>No colleges in this section</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map(c => {
            const syllData = c.stages.syllabus_submission?.data || {};
            const units = (syllData.units as { name: string; topics: string }[]) || [];
            return (
              <div key={c.id} className="card" onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: 15 }}>{c.name}</strong>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                      {(syllData.subject as string) || 'Subject not specified'} | Sem {(syllData.semester as string) || '—'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#6B7280' }}>
                    {units.length} units
                    <br />
                    {formatDate(c.stages.syllabus_submission?.completed_at)}
                  </div>
                </div>
                {units.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                    {units.map(u => (
                      <span key={u.name} className="pill" style={{ background: '#F3F4F6', fontSize: 11 }}>{u.name}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="fade-in">
      <h2>{greeting()}, Content Team</h2>
      <p style={{ color: '#6B7280', marginTop: -8, marginBottom: 24 }}>Syllabus review and coverage analysis</p>

      {contentNotifs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {contentNotifs.map(n => (
            <div key={n.id} className="notif">
              <span>{n.message}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{formatDate(n.timestamp)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">{pending.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Review</div>
          <div className="stat-value">{inReview.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{done.length}</div>
        </div>
      </div>

      <Section title="Pending Review" emoji="📋" items={pending} color="#B8410A" />
      <Section title="In Review" emoji="🔍" items={inReview} color="#175CD3" />
      <Section title="Completed" emoji="✅" items={done} color="#2D7A4F" />
    </div>
  );
};

export default ContentDash;
