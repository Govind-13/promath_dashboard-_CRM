import React, { useState } from 'react';
import type { College, Notification, StageData } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import { getProgress, formatDate } from '../../utils/college';
import StageEditor from './StageEditor';

interface Props {
  college: College;
  role: string;
  onBack: () => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
  addNotif: (n: Notification) => void;
}

const Detail: React.FC<Props> = ({ college, role, onBack, updateCollege, addNotif }) => {
  const [openStage, setOpenStage] = useState<string | null>(null);
  const pct = getProgress(college);

  const canEditStage = (stageTeam: string) => {
    if (role === 'admin') return true;
    return stageTeam === role;
  };

  const updateStageData = (stageId: string, data: Record<string, unknown>) => {
    updateCollege(college.id, c => {
      const sd = c.stages[stageId] || { status: 'not_started', completed_at: null, data: {} };
      return {
        ...c,
        stages: {
          ...c.stages,
          [stageId]: { ...sd, status: sd.status === 'not_started' ? 'in_progress' : sd.status, data: { ...sd.data, ...data } },
        },
      };
    });
  };

  const completeStage = (stageId: string) => {
    updateCollege(college.id, c => {
      const sd = c.stages[stageId] || { status: 'not_started', completed_at: null, data: {} };
      return {
        ...c,
        stages: {
          ...c.stages,
          [stageId]: { ...sd, status: 'completed', completed_at: new Date().toISOString() },
        },
      };
    });
    const stageLabel = STAGES.find(s => s.id === stageId)?.label || stageId;
    if (role !== 'admin') {
      addNotif({
        id: 'n' + Date.now(),
        role: 'admin',
        message: `${college.name}: "${stageLabel}" marked completed by ${role} team`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  };

  const updateMeta = (key: 'current_status' | 'additional_comments', value: string) => {
    updateCollege(college.id, c => ({ ...c, [key]: value }));
  };

  const groups = ['Discovery', 'Deal', 'Content', 'Implementation', 'Onboarding'];

  return (
    <div className="fade-in">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Back to Colleges
      </button>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>{college.name}</h2>
            <div style={{ color: '#6B7280', marginTop: 4 }}>
              {college.contact_name} — {college.contact_designation} | {college.location}
            </div>
            <div style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
              {college.phone} | {college.email}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{pct}%</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Pipeline Progress</div>
            <div className="progress-bar" style={{ width: 160, marginTop: 4 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="field">
          <label className="label">Current Status</label>
          <textarea className="input" rows={2} value={college.current_status || ''} onChange={e => updateMeta('current_status', e.target.value)} placeholder="Current status notes..." />
        </div>
        <div className="field">
          <label className="label">Additional Comments</label>
          <textarea className="input" rows={2} value={college.additional_comments || ''} onChange={e => updateMeta('additional_comments', e.target.value)} placeholder="Any additional comments..." />
        </div>
      </div>

      <h3 style={{ marginBottom: 16 }}>Pipeline Stages</h3>
      {groups.map(group => {
        const groupStages = STAGES.filter(s => s.group === group);
        return (
          <div key={group} style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#6B7280', letterSpacing: 1, marginBottom: 8 }}>{group}</h4>
            {groupStages.map(s => {
              const sd: StageData = college.stages[s.id] || { status: 'not_started', completed_at: null, data: {} };
              const isOpen = openStage === s.id;
              return (
                <div key={s.id} className="card" style={{ marginBottom: 8 }}>
                  <div
                    onClick={() => setOpenStage(isOpen ? null : s.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{s.icon}</span>
                      <strong>{s.label}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="pill" style={{
                        background: sd.status === 'completed' ? '#DCFCE7' : sd.status === 'in_progress' ? '#FEF3C7' : '#F3F4F6',
                        color: sd.status === 'completed' ? '#166534' : sd.status === 'in_progress' ? '#92400E' : '#6B7280',
                      }}>
                        {sd.status === 'completed' ? 'Completed' : sd.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </span>
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{sd.completed_at ? formatDate(sd.completed_at) : ''}</span>
                      <span style={{ color: '#9CA3AF' }}>{isOpen ? '▲' : '▼'}</span>
                    </span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <StageEditor
                        stage={s}
                        stageData={sd}
                        college={college}
                        canEdit={canEditStage(s.team)}
                        onUpdate={data => updateStageData(s.id, data)}
                        onComplete={() => completeStage(s.id)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Detail;
