import React, { useState, useEffect } from 'react';
import { College, JourneyStep, AutomationJourney } from '../../types';
import { CHANNEL_OPTIONS, CONDITION_OPTIONS, WF_TEMPLATES } from '../../constants';

interface JourneyBuilderProps {
  data: { colleges: College[] };
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

const CHMAP = Object.fromEntries(CHANNEL_OPTIONS.map(c => [c.id, c]));

const newJStep = (): JourneyStep => ({
  id: 'step_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
  channel: 'whatsapp',
  delay: 0,
  condition: 'always',
  message: '',
  enabled: true
});

export const JourneyBuilder: React.FC<JourneyBuilderProps> = ({ data, updateCollege }) => {
  const [selId, setSelId] = useState('');
  const [jName, setJName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [saved, setSaved] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any>(null);
  const [dataSrc, setDataSrc] = useState<'crm' | 'csv'>('crm');
  const [showTpl, setShowTpl] = useState(false);

  const col = data.colleges.find(c => c.id === selId);
  const existJ = col?.automation_journey;

  useEffect(() => {
    if (col && existJ) {
      setJName(existJ.name || '');
      setSteps(existJ.steps || []);
      setStartDate(existJ.start_date || '');
      setDataSrc(existJ.data_source || 'crm');
      setCsvPreview(existJ.csv_preview || null);
    } else {
      setJName('');
      setSteps([]);
      setStartDate('');
      setDataSrc('crm');
      setCsvPreview(null);
    }
    setSaved(false);
  }, [selId]);

  const addBlank = () => setSteps(s => [...s, newJStep()]);

  const loadTpl = (k: keyof typeof WF_TEMPLATES) => {
    const t = WF_TEMPLATES[k];
    if (!t) return;
    setSteps(s => [
      ...s,
      ...t.map((x, i) => ({
        ...newJStep(),
        ...x,
        id: 'tpl_' + k + '_' + i + '_' + Date.now()
      }))
    ]);
    setShowTpl(false);
  };

  const updStep = (id: string, f: keyof JourneyStep, v: any) => {
    setSteps(s => s.map(st => (st.id === id ? { ...st, [f]: v } : st)));
  };

  const remStep = (id: string) => {
    setSteps(s => s.filter(st => st.id !== id));
  };

  const movStep = (idx: number, dir: number) => {
    const a = [...steps];
    const sw = idx + dir;
    if (sw < 0 || sw >= a.length) return;
    [a[idx], a[sw]] = [a[sw], a[idx]];
    setSteps(a);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const content = ev.target?.result as string;
      const lines = content.split('\n').filter(Boolean);
      if (lines.length < 2) return;
      const hdrs = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 6).map(l => {
        const v = l.split(',');
        return Object.fromEntries(hdrs.map((h, i) => [h, (v[i] || '').trim()]));
      });
      setCsvPreview({
        total: lines.length - 1,
        headers: hdrs,
        rows
      });
      setDataSrc('csv');
    };
    r.readAsText(file);
  };

  const saveJ = () => {
    if (!selId || !jName || steps.length === 0) return;
    updateCollege(selId, c => ({
      ...c,
      automation_journey: {
        name: jName,
        start_date: startDate,
        steps,
        data_source: dataSrc,
        csv_preview: csvPreview,
        created_at: existJ?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'ready'
      }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyFromCollege = (srcId: string) => {
    const src = data.colleges.find(c => c.id === srcId);
    if (!src || !src.automation_journey) return;
    const j = src.automation_journey;
    setJName('Copy of ' + j.name);
    setStartDate('');
    setSteps((j.steps || []).map(s => ({ ...s, id: 'copy_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7) })));
  };

  const inp = { width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '12px', background: 'white', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' as const };
  const lbl = { fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px', display: 'block' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }} className="fade-in">
      <div style={{ display: 'grid', gap: '14px' }}>
        <div className="card bg-white p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="serif text-base font-semibold mb-4 text-[var(--ink)] leading-tight">Select Partner College</div>
          <div style={{ display: 'grid', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
            {data.colleges.map(c => {
              const hasJ = !!c.automation_journey;
              return (
                <div
                  key={c.id}
                  style={{
                    border: '2px solid',
                    borderRadius: '9px',
                    borderColor: selId === c.id ? 'var(--accent)' : 'var(--border)',
                    background: selId === c.id ? '#EBF4FF' : 'white',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setSelId(c.id)}
                    style={{ textAlign: 'left', padding: '10px 12px', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                      {c.location} · {c.total_students || '?'} students
                    </div>
                    {hasJ && (
                      <div className="text-[10px] text-[#067647] mt-1 font-semibold flex items-center gap-1">
                        <span>✅</span> Template set: {c?.automation_journey?.name}
                      </div>
                    )}
                  </button>
                  {hasJ && selId !== c.id && (
                    <div className="border-t border-[var(--border-soft)] py-1.5 px-3 bg-[#F8FAFC]">
                      <button
                        onClick={() => {
                          setSelId(c.id);
                          copyFromCollege(c.id);
                        }}
                        style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        📋 Copy this journey →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card bg-white p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="serif text-[14px] font-semibold mb-3 leading-tight">Communications Status</div>
          {CHANNEL_OPTIONS.map(ch => (
            <div key={ch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--ink)' }}>
                {ch.icon} {ch.label}
              </div>
              <div style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#F2F4F7', color: 'var(--muted)', fontWeight: 600 }}>
                Service Connected
              </div>
            </div>
          ))}
        </div>
      </div>

      {!selId ? (
        <div className="card bg-white min-h-[400px] rounded-2xl border border-[var(--border)] shadow-xs flex items-center justify-center">
          <div className="empty-state text-center text-[var(--muted)]">
            <div className="empty-state-icon text-3xl mb-2">⚙️</div>
            Select a candidate college to design its custom automated outreach workflows
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="card bg-white p-6 rounded-2xl border border-[var(--border)] shadow-xs">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div className="serif text-lg font-semibold">{col?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  {col?.location} · {col?.total_students || '?'} students · {col?.contact_name}
                </div>
              </div>
              {existJ && <div style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#ECFDF3', color: '#067647', fontWeight: 600 }}>Active in CRM</div>}
            </div>

            <label style={lbl}>Journey / Stage Label</label>
            <input
              style={inp}
              placeholder="e.g., General Onboarding - June 2026 Batch"
              value={jName}
              onChange={e => setJName(e.target.value)}
            />

            <div style={{ marginTop: '12px' }}>
              <label style={lbl}>Launch Baseline Date (Reference Day 0)</label>
              <input type="date" style={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
              {startDate && steps.length > 0 && (
                <div style={{ marginTop: '8px', padding: '10px 12px', background: '#EFF4FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px' }}>📅 Generated Dispatch Timeline</div>
                  {steps.filter(s => s.enabled).map((s, i) => {
                    const ch = CHMAP[s.channel] || CHANNEL_OPTIONS[0];
                    const d = new Date(startDate);
                    d.setDate(d.getDate() + (parseInt(s.delay as any) || 0));
                    return (
                      <div key={s.id} style={{ fontSize: '11px', color: 'var(--ink)', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--muted)', marginRight: '6px' }}>Step {i + 1}:</span>
                        <span style={{ marginRight: '6px' }}>{ch.icon}</span>
                        <span style={{ fontWeight: 600 }}>{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: '6px' }}>· Delay: {s.delay === 0 ? 'Instant' : s.delay + ' days'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card bg-white p-6 rounded-2xl border border-[var(--border)] shadow-xs">
            <div className="serif text-[15px] font-semibold mb-3">📂 Student Registrations Node</div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              {(['crm', 'csv'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setDataSrc(v)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '9px',
                    border: '2px solid',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderColor: dataSrc === v ? 'var(--accent)' : 'var(--border)',
                    background: dataSrc === v ? '#EBF0FA' : 'white',
                    color: dataSrc === v ? 'var(--accent)' : 'var(--muted)'
                  }}
                >
                  {v === 'crm' ? '🏛️ Import CRM registers' : '📄 Import Student Spreadsheet (CSV)'}
                </button>
              ))}
            </div>

            {dataSrc === 'crm' && col && (
              <div style={{ padding: '12px', background: 'var(--surface-alt)', borderRadius: '9px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>CRM Partner Profile</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--muted)]">College: </span>
                    <span className="font-semibold text-[var(--ink)]">{col.name}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Contact: </span>
                    <span className="font-semibold text-[var(--ink)]">{col.contact_name}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Core Region: </span>
                    <span className="font-semibold text-[var(--ink)]">{col.location}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Enrolled Count: </span>
                    <span className="font-semibold text-[var(--ink)]">{col.total_students || 'Not set'} students</span>
                  </div>
                </div>
              </div>
            )}

            {dataSrc === 'csv' && (
              <div>
                <label style={{ display: 'block', padding: '16px', border: '2px dashed var(--border)', borderRadius: '9px', cursor: 'pointer', textAlign: 'center', background: 'var(--surface-alt)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📄</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Import CSV File</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>Headers required: Name, Reg No, Phone, Email</div>
                  <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
                </label>
                {csvPreview && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#ECFDF3', borderRadius: '9px', border: '1px solid #A2E9C1' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#067647', marginBottom: '8px' }}>✓ Loaded {csvPreview.total} students from CSV</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="w-full text-[10px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-[#ECFDF3] text-[#067647]">
                            {csvPreview.headers.map((h: string) => (
                              <th key={h} className="text-left p-1.5 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="border-b border-[#ECFDF3]">
                              {csvPreview.headers.map((h: string) => (
                                <td key={h} className="p-1.5 text-gray-700">
                                  {row[h] || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card bg-white p-6 rounded-2xl border border-[var(--border)] shadow-xs">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div className="serif text-[15px] font-semibold">Campaign Operations Dispatch</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{steps.length} sequential operations</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowTpl(!showTpl)}
                  className="py-1 px-3.5 rounded-lg border border-[var(--accent)] hover:bg-[#F2EDFB] text-xs font-semibold text-[var(--accent)] cursor-pointer"
                >
                  ⚙️ Standard Presets
                </button>
                <button
                  onClick={addBlank}
                  className="py-1 px-3.5 rounded-lg border-0 bg-[var(--accent)] text-white hover:opacity-95 text-xs font-semibold cursor-pointer shadow-indigo-50 shadow-sm"
                >
                  + Add Dispatch Row
                </button>
              </div>
            </div>

            {showTpl && (
              <div className="p-4 bg-gray-50 border border-[var(--border)] rounded-xl mb-4">
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>Load sequential dispatch template:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {(Object.keys(WF_TEMPLATES) as Array<keyof typeof WF_TEMPLATES>).map(k => (
                    <button
                      key={k}
                      onClick={() => loadTpl(k)}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                    >
                      {k === 'onboarding' ? '📦 Welcome & Onboard' : k === 'first_usage' ? '🚀 First Activity Nudge' : k === 'reactivation' ? '⚡ Wake inactive users' : k === 'exam_prep' ? '📝 Exam Prep Track' : '🎯 Assessment Quiz'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {steps.length === 0 ? (
              <div className="empty-state text-center py-10 text-[var(--muted)]">
                <div className="empty-state-icon text-2xl mb-2">➕</div>No communication schedules listed. Add dispatch rows or import a template above!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {steps.map((step, idx) => {
                  const ch = CHMAP[step.channel] || CHANNEL_OPTIONS[0];
                  return (
                    <div key={step.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', opacity: step.enabled ? 1 : 0.55 }} className="bg-white hover:border-[var(--muted-soft)] transition">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: ch.color + '22', color: ch.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                          {idx + 1}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', flex: 1 }}>
                          {ch.icon} {ch.label}
                          {step.delay > 0 && <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400, marginLeft: '8px' }}>· Delay: Day {step.delay}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => movStep(idx, -1)} style={{ padding: '3px 7px', border: '1px solid var(--border)', borderRadius: '5px', background: 'white', cursor: 'pointer', fontSize: '10px' }}>↑</button>
                          <button onClick={() => movStep(idx, 1)} style={{ padding: '3px 7px', border: '1px solid var(--border)', borderRadius: '5px', background: 'white', cursor: 'pointer', fontSize: '10px' }}>↓</button>
                          <button
                            onClick={() => updStep(step.id, 'enabled', !step.enabled)}
                            className="p-1 px-[9px] border rounded text-[10px] font-bold cursor-pointer"
                            style={{ borderColor: step.enabled ? '#067647' : 'var(--border)', color: step.enabled ? '#067647' : 'var(--muted)', background: 'white' }}
                          >
                            {step.enabled ? 'ON' : 'OFF'}
                          </button>
                          <button onClick={() => remStep(step.id)} style={{ padding: '3px 8px', border: '1px solid #FECDCA', borderRadius: '5px', background: '#FEF3F2', cursor: 'pointer', fontSize: '10px', color: '#B42318' }}>✕</button>
                        </div>
                      </div>

                      <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={lbl}>Dispatch Channel</label>
                          <select style={inp} value={step.channel} onChange={e => updStep(step.id, 'channel', e.target.value)}>
                            {CHANNEL_OPTIONS.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.icon} {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Timeline Offset (delay in days)</label>
                          <input type="number" min="0" style={inp} value={step.delay} onChange={e => updStep(step.id, 'delay', parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label style={lbl}>Gated Condition Check</label>
                          <select style={inp} value={step.condition} onChange={e => updStep(step.id, 'condition', e.target.value)}>
                            {CONDITION_OPTIONS.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ padding: '0 14px 12px' }}>
                        <label style={lbl}>Message Template Payload / Activity Outline</label>
                        <textarea
                          style={{ ...inp, minHeight: '64px', resize: 'vertical', lineHeight: 1.5 }}
                          value={step.message}
                          onChange={e => updStep(step.id, 'message', e.target.value)}
                          placeholder="Compose dispatch. Use [name], [link] as parameters template fillers."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
            {saved && <div style={{ padding: '10px 16px', borderRadius: '9px', background: '#ECFDF3', color: '#067647', fontSize: '13px', fontWeight: 600 }}>✓ Workflow journey successfully locked!</div>}
            <button
              onClick={saveJ}
              disabled={!jName || steps.length === 0}
              className={`py-3 px-6 rounded-xl font-semibold border-0 text-sm transition duration-150 ${!jName || steps.length === 0 ? 'bg-gray-200 cursor-not-allowed text-[var(--muted)]' : 'bg-[var(--accent)] text-white hover:opacity-95 cursor-pointer shadow-indigo-100 shadow-sm'}`}
            >
              💾 Save Dispatch Automation Workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
