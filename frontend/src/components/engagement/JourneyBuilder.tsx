import React, { useState } from 'react';
import type { AppData, College, JourneyStep } from '../../types/college.types';
import { CHANNEL_OPTIONS, CONDITION_OPTIONS, WF_TEMPLATES } from '../../constants/engagement';

interface Props {
  data: AppData;
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

const TEMPLATES = Object.entries(WF_TEMPLATES).map(([id, steps]) => ({
  id,
  label: id.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
  steps: steps.map((s, i) => ({
    id: `${id}_${i}`,
    ...s,
    enabled: true,
  })),
}));

const JourneyBuilder: React.FC<Props> = ({ data, updateCollege }) => {
  const [selectedId, setSelectedId] = useState('');

  const engagedColleges = data.colleges.filter(c =>
    c.stages.implementation?.status === 'completed' || c.stages.orientation?.status !== 'not_started'
  );

  const college = engagedColleges.find(c => c.id === selectedId);
  const journey: JourneyStep[] = college?.automation_journey || [];

  const setJourney = (steps: JourneyStep[]) => {
    if (!selectedId) return;
    updateCollege(selectedId, c => ({ ...c, automation_journey: steps }));
  };

  const applyTemplate = (templateId: string) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (tmpl) setJourney(tmpl.steps);
  };

  const updateStep = (idx: number, updates: Partial<JourneyStep>) => {
    setJourney(journey.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const removeStep = (idx: number) => setJourney(journey.filter((_, i) => i !== idx));

  const addStep = () => {
    setJourney([...journey, {
      id: `step_${Date.now()}`,
      channel: 'whatsapp',
      delay: 0,
      condition: 'always',
      message: '',
      enabled: true,
    }]);
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const next = [...journey];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setJourney(next);
  };

  return (
    <div>
      <h3>Automation Journey Builder</h3>
      <p style={{ color: '#6B7280', marginBottom: 16 }}>Build automated engagement sequences per college</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="field" style={{ flex: 1 }}>
          <label className="label">Select College</label>
          <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">Choose a college...</option>
            {engagedColleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedId && (
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Apply Template</label>
            <select className="input" onChange={e => { if (e.target.value) applyTemplate(e.target.value); e.target.value = ''; }}>
              <option value="">Choose a template...</option>
              {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label} ({t.steps.length} steps)</option>)}
            </select>
          </div>
        )}
      </div>

      {selectedId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4>Journey Steps ({journey.length})</h4>
            <button className="btn btn-primary" onClick={addStep}>+ Add Step</button>
          </div>

          {journey.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🛤️</div>
              <div>No journey steps configured</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>Apply a template or add steps manually</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {journey.map((step, i) => {
                const ch = CHANNEL_OPTIONS.find(c => c.id === step.channel);
                return (
                  <div key={step.id} className="card" style={{ opacity: step.enabled === false ? 0.5 : 1, borderLeft: `4px solid ${ch?.color || '#6B7280'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#6B7280' }}>Step {i + 1}</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                          <input type="checkbox" checked={step.enabled !== false} onChange={e => updateStep(i, { enabled: e.target.checked })} />
                          Enabled
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => moveStep(i, -1)} disabled={i === 0} title="Move up">↑</button>
                        <button className="btn-icon" onClick={() => moveStep(i, 1)} disabled={i === journey.length - 1} title="Move down">↓</button>
                        <button className="btn-icon" onClick={() => removeStep(i)} title="Remove">🗑️</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 12, marginBottom: 8 }}>
                      <div className="field">
                        <label className="label">Channel</label>
                        <select className="input" value={step.channel} onChange={e => updateStep(i, { channel: e.target.value })}>
                          {CHANNEL_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label className="label">Delay (days)</label>
                        <input className="input" type="number" min={0} value={step.delay} onChange={e => updateStep(i, { delay: Number(e.target.value) })} />
                      </div>
                      <div className="field">
                        <label className="label">Condition</label>
                        <select className="input" value={step.condition} onChange={e => updateStep(i, { condition: e.target.value })}>
                          {CONDITION_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Message</label>
                      <textarea className="input" rows={2} value={step.message} onChange={e => updateStep(i, { message: e.target.value })} placeholder="Message content..." />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JourneyBuilder;
