import React, { useState } from 'react';
import type { AppData, College } from '../../types/college.types';
import { ENG_STAGES, WF_STEPS } from '../../constants/engagement';
import { greeting } from '../../utils/college';
import UsageTracker from '../engagement/UsageTracker';
import JourneyBuilder from '../engagement/JourneyBuilder';

interface Props {
  data: AppData;
  onSelect: (id: string) => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

type Tab = 'overview' | 'workflows' | 'usage' | 'journeys' | 'analytics';

const EngageDash: React.FC<Props> = ({ data, onSelect, updateCollege }) => {
  const [tab, setTab] = useState<Tab>('overview');

  const engagedColleges = data.colleges.filter(c =>
    c.stages.implementation?.status === 'completed' || c.stages.orientation?.status !== 'not_started'
  );

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'workflows', label: 'Workflows', icon: '⚙️' },
    { id: 'usage', label: 'Usage', icon: '📈' },
    { id: 'journeys', label: 'Journeys', icon: '🛤️' },
    { id: 'analytics', label: 'Analytics', icon: '🔍' },
  ];

  const renderOverview = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
        {ENG_STAGES.map(es => {
          const count = engagedColleges.filter(c => c.engagement_journey?.[es.id]).length;
          return (
            <div key={es.id} className="stat-card" style={{ borderLeft: `4px solid ${es.color}` }}>
              <div className="stat-label">{es.icon} {es.label}</div>
              <div className="stat-value">{count}</div>
            </div>
          );
        })}
      </div>

      <h3>Engaged Colleges ({engagedColleges.length})</h3>
      {engagedColleges.length === 0 ? (
        <div className="empty-state" style={{ padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
          <div>No colleges in engagement phase yet</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Colleges move here after implementation is complete</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {engagedColleges.map(c => (
            <div key={c.id} className="card" onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{c.location} | {c.total_students} students</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {ENG_STAGES.map(es => (
                    <span key={es.id} className="pill" style={{
                      background: c.engagement_journey?.[es.id] ? es.bg : '#F3F4F6',
                      color: c.engagement_journey?.[es.id] ? es.color : '#9CA3AF',
                      fontSize: 11,
                    }}>
                      {es.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderWorkflows = () => (
    <>
      <h3>Engagement Workflows</h3>
      <p style={{ color: '#6B7280', marginBottom: 20 }}>Standardized step-by-step workflows for each engagement stage</p>
      {ENG_STAGES.map(es => {
        const steps = WF_STEPS[es.id] || [];
        return (
          <div key={es.id} className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ background: es.bg, color: es.color, padding: '4px 8px', borderRadius: 6, fontSize: 14 }}>{es.icon}</span>
              {es.label}
              <span className="pill" style={{ background: es.bg, color: es.color }}>{steps.length} steps</span>
            </h4>
            <div style={{ display: 'grid', gap: 6 }}>
              {steps.map((step, i) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '4px 0' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: es.bg, color: es.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );

  const renderAnalytics = () => (
    <>
      <h3>Engagement Analytics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Engaged</div>
          <div className="stat-value">{engagedColleges.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{engagedColleges.reduce((s, c) => s + (Number(c.total_students) || 0), 0).toLocaleString('en-IN')}</div>
        </div>
      </div>
      <div className="card">
        <h4>Stage Distribution</h4>
        {ENG_STAGES.map(es => {
          const count = engagedColleges.filter(c => c.engagement_journey?.[es.id]).length;
          const pct = engagedColleges.length ? Math.round((count / engagedColleges.length) * 100) : 0;
          return (
            <div key={es.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ width: 140, fontSize: 13 }}>{es.icon} {es.label}</span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: es.color }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, width: 40, textAlign: 'right' }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="fade-in">
      <h2>{greeting()}, Engagement Team</h2>
      <p style={{ color: '#6B7280', marginTop: -8, marginBottom: 24 }}>Student engagement and retention</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: tab === t.id ? '2px solid var(--accent)' : 'none' }}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && renderOverview()}
      {tab === 'workflows' && renderWorkflows()}
      {tab === 'usage' && <UsageTracker data={data} updateCollege={updateCollege} />}
      {tab === 'journeys' && <JourneyBuilder data={data} updateCollege={updateCollege} />}
      {tab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default EngageDash;
