import React, { useState, useMemo } from 'react';
import { College } from '../../types';
import { JourneyBuilder } from './JourneyBuilder';
import { UsageTracker } from './UsageTracker';
import { CHANNEL_OPTIONS } from '../../constants';

interface EngagementDashboardProps {
  data: { colleges: College[] };
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

export const EngagementDashboard: React.FC<EngagementDashboardProps> = ({ data, updateCollege }) => {
  const [tab, setTab] = useState<'overview' | 'pipeline' | 'actions' | 'journey' | 'usage'>('overview');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter colleges that signed MOU or completed syllabus submission
  const engColleges = useMemo(() => {
    return data.colleges.filter(c =>
      c.stages.mou_signing?.status === 'completed' ||
      c.stages.syllabus_submission?.status === 'completed' ||
      c.stages.license_creation?.status === 'completed' ||
      c.stages.orientation?.status === 'completed'
    );
  }, [data.colleges]);

  const stats = useMemo(() => {
    const total = engColleges.length;
    const withJ = engColleges.filter(c => !!c.automation_journey);
    const inProg = withJ.filter(c => {
      const steps = (c.automation_journey?.steps || []).filter(s => s.enabled !== false);
      const done = steps.filter(s => !!(c.automation_journey_progress?.[s.id]?.done)).length;
      return done > 0 && done < steps.length;
    });
    const completed = withJ.filter(c => {
      const steps = (c.automation_journey?.steps || []).filter(s => s.enabled !== false);
      const done = steps.filter(s => !!(c.automation_journey_progress?.[s.id]?.done)).length;
      return steps.length > 0 && done === steps.length;
    });
    return { total, won: withJ.length, inProg: inProg.length, completed: completed.length };
  }, [engColleges]);

  const getEngStage = (c: College) => {
    if (c.automation_journey) {
      const steps = (c.automation_journey.steps || []).filter(s => s.enabled !== false);
      const done = steps.filter(s => !!(c.automation_journey_progress?.[s.id]?.done)).length;
      if (done === steps.length) return 'completed';
      if (done > 0) return 'in_progress';
    }
    return 'no_journey';
  };

  const getLastAction = (c: College) => {
    if (!c.automation_journey_progress) return null;
    const dates = Object.values(c.automation_journey_progress)
      .map(p => p.date)
      .filter(Boolean) as string[];
    if (dates.length === 0) return null;
    return dates.sort().reverse()[0];
  };

  const daysSince = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    return Math.max(0, diff);
  };

  const toggleStep = (collegeId: string, stepId: string, isDone: boolean) => {
    updateCollege(collegeId, c => {
      const progress = { ...(c.automation_journey_progress || {}) };
      if (!isDone) {
        progress[stepId] = {
          done: true,
          date: new Date().toISOString().slice(0, 10),
          outcome: 'success',
          note: 'Outreach dispatched'
        };
      } else {
        delete progress[stepId];
      }
      return {
        ...c,
        automation_journey_progress: progress
      };
    });
  };

  const editStepValue = (collegeId: string, stepId: string, field: 'outcome' | 'note', value: string) => {
    updateCollege(collegeId, c => {
      const progress = { ...(c.automation_journey_progress || {}) };
      if (progress[stepId]) {
        progress[stepId] = {
          ...progress[stepId],
          [field]: value
        };
      }
      return {
        ...c,
        automation_journey_progress: progress
      };
    });
  };

  const getChannelIcon = (channel: string) => {
    const ch = CHANNEL_OPTIONS.find(x => x.id === channel);
    return ch ? { icon: ch.icon, bg: ch.color + '15', color: ch.color, label: ch.label } : { icon: '💬', bg: '#EFF4FF', color: 'var(--accent)', label: ' outreach' };
  };

  const tabStyle = (t: typeof tab) => ({
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    background: tab === t ? 'var(--accent)' : 'transparent',
    color: tab === t ? 'white' : 'var(--muted)',
    transition: 'all 0.15s'
  });

  const OUTCOMES = [
    { v: '', l: '— Log result outcome —' },
    { v: 'success', l: '✅ Responded / Enrolled successfully' },
    { v: 'no_resp', l: '🔕 No response' },
    { v: 'partial', l: '⚠️ Partial setup — outstanding details' },
    { v: 'called', l: '📞 HOD call request logged' },
    { v: 'skip', l: '⏭ Skipping/Bypassing this node' }
  ];

  return (
    <div className="fade-in">
      <div className="header mb-6">
        <div>
          <h1>Engagement Dashboard</h1>
          <div className="subtitle font-medium">Coordinate student onboarding, video modules activity dispatches, and syllabus prep.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase font-semibold">Ready for Engagement</span>
          <span className="text-3xl font-bold font-serif">{stats.total}</span>
        </div>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase font-semibold">Active Campaigns</span>
          <span className="text-3xl font-bold font-serif">{stats.won}</span>
        </div>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase font-semibold">In Progress</span>
          <span className="text-3xl font-bold font-serif">{stats.inProg}</span>
        </div>
        <div className="stat-card border border-[var(--border)] p-4 rounded-xl flex flex-col justify-between min-h-[110px] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase font-semibold">Schedules Completed</span>
          <span className="text-3xl font-bold font-serif">{stats.completed}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'var(--surface)', borderRadius: '10px', padding: '5px', width: 'fit-content' }}>
        {(['overview', 'pipeline', 'actions', 'journey', 'usage'] as const).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊 Live Overview' : t === 'pipeline' ? '🔄 Pipeline Track' : t === 'actions' ? "✅ Action Queue" : t === 'journey' ? '⚙️ Journey Builder' : '📈 Usage Monitor'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-3">
          {engColleges.length === 0 ? (
            <div className="card bg-white p-6 border rounded-xl text-center">
              <div className="empty-state text-[var(--muted)]">No partner colleges are ready for student campaigns yet. (Awaiting signed MOU).</div>
            </div>
          ) : (
            engColleges.map(c => {
              const journey = c.automation_journey;
              const jSteps = journey ? (journey.steps || []).filter(s => s.enabled !== false) : [];
              const doneSteps = jSteps.filter(s => !!(c.automation_journey_progress?.[s.id]?.done));
              const pct = jSteps.length ? Math.round((doneSteps.length / jSteps.length) * 100) : 0;
              const nextStep = jSteps.find(s => !(c.automation_journey_progress?.[s.id]?.done));
              const isExpanded = expandedId === c.id;

              return (
                <div key={c.id} className="card bg-white p-0 rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF4FF', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '18px', flexShrink: 0 }} className="justify-center">
                      🎯
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-bold text-sm text-[var(--ink)]">{c.name}</div>
                      <div className="text-[11px] text-[var(--muted)] mt-1 font-medium select-none">
                        {c.location} · {c.total_students || '?'} students · {c.contact_name}
                        {(() => {
                          const d = daysSince(getLastAction(c));
                          if (d !== null) {
                            return (
                              <span style={{ marginLeft: '8px', fontWeight: 600, color: d > 14 ? '#B42318' : d > 7 ? '#175CD3' : '#067647' }}>
                                {d === 0 ? '· Updated today' : `· Inactive for ${d}d`}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      {!journey && <div className="mt-2 text-[10px] text-[#B54708] font-bold">⚠️ No outreach journey set up. Head to Journey Builder tab!</div>}
                      {journey && nextStep && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-[#FFF9EB] border border-[#FEDF89] px-2.5 py-0.5 rounded-full text-[10px] text-[#B54708] font-semibold">
                          <span>{getChannelIcon(nextStep.channel).icon}</span>
                          <span>Next dispatch: {nextStep.channel.toUpperCase()} (Day {nextStep.delay})</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 text-xs">
                      {journey && <div className="font-bold text-[var(--ink-soft)]">{journey.name}</div>}
                      <div className="text-[11px] text-[var(--muted)] mt-1 font-semibold">
                        Progress: {doneSteps.length}/{jSteps.length} stages ({pct}%)
                      </div>
                    </div>
                    <div className="text-gray-400 text-base font-bold ml-2">{isExpanded ? '▲' : '▼'}</div>
                  </div>

                  <div className="h-1 bg-gray-100 mx-5 rounded">
                    <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[#2E90FA] rounded transition-all duration-300" style={{ width: pct + '%' }}></div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-[var(--border-soft)] bg-[#F8FAFC]">
                      {!journey ? (
                        <div className="text-center py-4">
                          <p className="text-sm font-medium text-[var(--muted)] mb-3">No steps customized inside campaign portfolio.</p>
                          <button onClick={() => setTab('journey')} className="py-1.5 px-4 bg-[var(--accent)] hover:opacity-95 text-white font-semibold rounded-lg text-xs border-0 cursor-pointer">
                            Build Outreach Flow →
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-bold text-[var(--ink)] mb-3 uppercase tracking-wider">Scheduled Touchpoints:</div>
                          <div className="grid gap-2">
                            {jSteps.map((step, idx) => {
                              const prog = c.automation_journey_progress?.[step.id];
                              const isDone = !!prog?.done;
                              const ch = getChannelIcon(step.channel);
                              return (
                                <div key={step.id} className={`p-3 rounded-xl border flex flex-col gap-2 ${isDone ? 'bg-[#ECFDF3] border-[#A2E9C1]' : 'bg-white border-gray-200'}`}>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isDone}
                                      onChange={() => toggleStep(c.id, step.id, isDone)}
                                      className="w-4 h-4 rounded text-[#067647] accent-[#067647]"
                                    />
                                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ background: ch.bg, color: ch.color }}>{ch.icon} {ch.label}</span>
                                    <span className="text-xs font-semibold text-[var(--muted)]">Delay offset: Day {step.delay}</span>
                                    <p className={`flex-1 text-xs truncate max-w-lg ${isDone ? 'line-through text-[#067647]' : 'text-[var(--ink-soft)]'}`}>{step.message}</p>
                                    {isDone && <span className="text-[10.5px] font-bold text-[#067647]">On {prog.date}</span>}
                                  </div>
                                  {isDone && (
                                    <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                      <select
                                        value={prog.outcome || ''}
                                        onChange={e => editStepValue(c.id, step.id, 'outcome', e.target.value)}
                                        className="py-1.5 px-3 border border-gray-200 bg-white text-xs rounded-lg outline-none font-medium cursor-pointer"
                                      >
                                        {OUTCOMES.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                      </select>
                                      <input
                                        placeholder="Add outreach dispatch notes..."
                                        value={prog.note || ''}
                                        onChange={e => editStepValue(c.id, step.id, 'note', e.target.value)}
                                        className="py-1.5 px-3 border border-gray-200 bg-white text-xs rounded-lg outline-none font-medium"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PIPELINE KANBAN */}
      {tab === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {[
            { id: 'no_journey', name: 'No Campaign Configured', color: '#6B7280', bg: '#EAECF0' },
            { id: 'in_progress', name: 'Outreach In Progress', color: '#175CD3', bg: '#EFF4FF' },
            { id: 'completed', name: 'Campaign Complete', color: '#067647', bg: '#ECFDF3' }
          ].map(col => {
            const matches = engColleges.filter(c => getEngStage(c) === col.id);
            return (
              <div key={col.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 min-h-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.name}</span>
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded-full" style={{ background: col.bg, color: col.color }}>{matches.length}</span>
                </div>
                {matches.length === 0 ? (
                  <div className="text-center py-10 text-xs font-semibold text-[var(--muted)]">No colleges inside block.</div>
                ) : (
                  matches.map(c => {
                    const steps = c.automation_journey?.steps?.filter(s => s.enabled) || [];
                    const fulfilled = steps.filter(s => !!(c.automation_journey_progress?.[s.id]?.done)).length;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setTab('overview');
                          setExpandedId(c.id);
                        }}
                        className="bg-white border rounded-xl p-3 mb-3 hover:border-indigo-200 cursor-pointer shadow-xs transition"
                      >
                        <div className="font-bold text-xs text-[var(--ink)] leading-tight">{c.name}</div>
                        <div className="text-[10px] text-[var(--muted)] mt-1">{c.location}</div>
                        {c.automation_journey && (
                          <div className="text-[10px] text-indigo-600 font-semibold mt-2.5">
                            Index: {fulfilled}/{steps.length} dispatched
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ACTION DISPATCH QUEUE */}
      {tab === 'actions' && (
        <div className="card bg-white p-6 border rounded-2xl shadow-xs">
          <div className="mb-4">
            <h2 className="font-serif text-lg font-bold">Outstanding Action Dispatches</h2>
            <p className="text-xs text-[var(--muted)] mt-1">Pending outreach steps needing manual check validation today</p>
          </div>

          {(() => {
            const actionItems = engColleges.map(c => {
              const j = c.automation_journey;
              if (!j) return null;
              const pending = (j.steps || []).filter(s => s.enabled !== false && !c.automation_journey_progress?.[s.id]?.done);
              if (pending.length === 0) return null;
              const current = pending[0];
              const details = getChannelIcon(current.channel);
              return { c, j, current, details };
            }).filter(Boolean);

            if (actionItems.length === 0) {
              return <div className="text-center py-12 text-sm text-[var(--muted)] font-semibold">No dispatches pending today! Onboarding complete.</div>;
            }

            return (
              <div className="grid gap-2.5">
                {actionItems.map(item => {
                  if (!item) return null;
                  const { c, j, current, details } = item;
                  return (
                    <div key={c.id} className="p-3 border rounded-xl flex items-center justify-between gap-4 bg-white hover:bg-gray-50 transition border-gray-200">
                      <div className="flex-1 min-width-0">
                        <div className="font-bold text-xs text-[var(--ink)]">{c.name}</div>
                        <div className="flex gap-2 items-center flex-wrap mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ background: details.bg, color: details.color }}>
                            {details.icon} {details.label}
                          </span>
                          <span className="text-[11px] font-medium text-gray-500">Day offset: {current.delay}</span>
                          <p className="text-[11px] text-[var(--ink-soft)] font-medium max-w-md truncate">{current.message}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStep(c.id, current.id, false)}
                        className="py-1.5 px-3 text-xs bg-[var(--accent)] text-white hover:bg-opacity-95 rounded-lg font-bold border-0 cursor-pointer flex-shrink-0"
                      >
                        Mark Dispatched ✓
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {tab === 'journey' && <JourneyBuilder data={data} updateCollege={updateCollege} />}
      {tab === 'usage' && <UsageTracker data={data} updateCollege={updateCollege} />}
    </div>
  );
};
