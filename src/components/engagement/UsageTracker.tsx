import React, { useState } from 'react';
import { College, UsageCourse, UsageEntry } from '../../types';

interface UsageTrackerProps {
  data: { colleges: College[] };
  updateCollege: (id: string, fn: (c: College) => College) => void;
}

export const UsageTracker: React.FC<UsageTrackerProps> = ({ data, updateCollege }) => {
  const [selId, setSelId] = useState('');
  const [selCourse, setSelCourse] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', enrolled: '' });
  const [newEntry, setNewEntry] = useState({ date: '', users_using: '', total_hours: '', event: '' });

  const col = data.colleges.find(c => c.id === selId);
  const courses = col?.usage_courses || [];
  const activeCourse = courses.find(c => c.id === selCourse);
  const entries = activeCourse?.entries || [];

  const addCourse = () => {
    if (!newCourse.name.trim() || !newCourse.enrolled) return;
    const courseObj: UsageCourse = {
      id: 'course_' + Date.now(),
      name: newCourse.name.trim(),
      enrolled: parseInt(newCourse.enrolled) || 0,
      entries: []
    };
    updateCollege(selId, c => ({
      ...c,
      usage_courses: [...(c.usage_courses || []), courseObj]
    }));
    setSelCourse(courseObj.id);
    setNewCourse({ name: '', enrolled: '' });
    setShowAddCourse(false);
  };

  const addEntry = () => {
    if (!newEntry.date || !newEntry.users_using || !newEntry.total_hours) return;
    const entry: UsageEntry = {
      id: 'entry_' + Date.now(),
      date: newEntry.date,
      users_using: parseInt(newEntry.users_using) || 0,
      total_hours: parseFloat(newEntry.total_hours) || 0,
      event: newEntry.event.trim()
    };
    updateCollege(selId, c => ({
      ...c,
      usage_courses: (c.usage_courses || []).map(cr =>
        cr.id === selCourse ? { ...cr, entries: [...(cr.entries || []), entry].sort((a, b) => a.date.localeCompare(b.date)) } : cr
      )
    }));
    setNewEntry({ date: '', users_using: '', total_hours: '', event: '' });
    setShowAddEntry(false);
  };

  const deleteEntry = (entryId: string) => {
    updateCollege(selId, c => ({
      ...c,
      usage_courses: (c.usage_courses || []).map(cr =>
        cr.id === selCourse ? { ...cr, entries: (cr.entries || []).filter(e => e.id !== entryId) } : cr
      )
    }));
  };

  const deleteCourse = (courseId: string) => {
    if (!confirm('Are you certain you want to remove this course and all its study trends dataset?')) return;
    updateCollege(selId, c => ({
      ...c,
      usage_courses: (c.usage_courses || []).filter(cr => cr.id !== courseId)
    }));
    if (selCourse === courseId) setSelCourse('');
  };

  const downloadCSV = () => {
    if (!activeCourse || !entries.length || !col) return;
    const enrolled = activeCourse.enrolled;
    let csv = activeCourse.name + ',' + entries.map(e => e.date).join(',') + '\n';
    csv += 'Total Registered Users,' + entries.map(() => enrolled).join(',') + '\n';
    csv += 'Active students inside session,' + entries.map(e => e.users_using).join(',') + '\n';
    csv += 'Total session hours,' + entries.map(e => e.total_hours.toFixed(2)).join(',') + '\n';
    csv += 'Participation Index (% Users),' + entries.map(e => ((e.users_using / enrolled) * 100).toFixed(2) + '%').join(',') + '\n';
    csv += 'Average study duration per user (mins),' + entries.map(e => (e.users_using > 0 ? Math.round((e.total_hours * 60) / e.users_using) : 0)).join(',') + '\n';
    csv += 'Campaign markers / WhatsApp events,' + entries.map(e => e.event || '').join(',') + '\n';

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${col.name}_${activeCourse.name}_usage_data.csv`.replace(/[^a-zA-Z0-9_.-]/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  };

  const inp = { width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid var(--border)', fontSize: '12px', background: 'white', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' as const };
  const lbl = { fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px', display: 'block' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }} className="fade-in">
      {/* College List */}
      <div style={{ display: 'grid', gap: '14px' }}>
        <div className="card bg-white p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="serif text-base font-semibold mb-4 text-[var(--ink)] leading-tight">Partner Colleges</div>
          <div style={{ display: 'grid', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
            {data.colleges.map(c => {
              const cCount = c.usage_courses?.length || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelId(c.id);
                    setSelCourse('');
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: '2px solid',
                    cursor: 'pointer',
                    borderColor: selId === c.id ? 'var(--accent)' : 'var(--border)',
                    background: selId === c.id ? '#EBF4FF' : 'white',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                    {c.location} · {cCount} registered course{cCount !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selId && (
          <div className="card bg-white p-5 rounded-2xl border border-[var(--border)] shadow-xs">
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '10px' }} className="flex justify-between">
              <div className="serif font-semibold text-sm">Target Courses</div>
              <button
                onClick={() => setShowAddCourse(true)}
                className="py-1 px-3 bg-[var(--accent)] text-white font-semibold text-xs border-0 rounded-md cursor-pointer hover:opacity-95"
              >
                + Add
              </button>
            </div>

            {courses.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '16px 0' }}>No courses mapped yet</div>
            ) : (
              <div style={{ display: 'grid', gap: '6px' }}>
                {courses.map(cr => (
                  <div key={cr.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setSelCourse(cr.id)}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: '2px solid',
                        cursor: 'pointer',
                        fontSize: '11px',
                        borderColor: selCourse === cr.id ? 'var(--accent)' : 'var(--border)',
                        background: selCourse === cr.id ? '#EBF0FA' : 'white',
                      }}
                    >
                      <div className="font-semibold text-gray-800 text-xs">{cr.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Enrolled: {cr.enrolled} · {cr.entries?.length || 0} logs
                      </div>
                    </button>
                    <button
                      onClick={() => deleteCourse(cr.id)}
                      className="p-1 text-[#B42318] bg-[#FEF3F2] hover:bg-red-100 rounded border border-red-200 cursor-pointer text-xs"
                      title="Delete course"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddCourse && (
              <div style={{ marginTop: '10px', padding: '12px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Add Target Subject</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <label style={lbl}>Course Name</label>
                    <input
                      style={inp}
                      placeholder="e.g. Linear Algebra-Sem 1"
                      value={newCourse.name}
                      onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Student Population</label>
                    <input
                      type="number"
                      style={inp}
                      placeholder="e.g. 540"
                      value={newCourse.enrolled}
                      onChange={e => setNewCourse({ ...newCourse, enrolled: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={addCourse} className="flex-1 py-1.5 bg-[var(--accent)] hover:bg-opacity-95 rounded-md text-white font-semibold text-xs border-0 cursor-pointer">
                      Save Mapped Course
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCourse(false);
                        setNewCourse({ name: '', enrolled: '' });
                      }}
                      className="py-1.5 px-3 border border-[var(--border)] rounded-md bg-white text-xs font-semibold text-[var(--muted)] cursor-pointer hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats and Log Tables */}
      {!selId ? (
        <div className="card bg-white min-h-[400px] rounded-2xl border border-[var(--border)] shadow-xs flex items-center justify-center">
          <div className="empty-state text-center text-[var(--muted)]">
            <div className="empty-state-icon text-3xl mb-2">📈</div>
            Select college partner to review academic telemetry metrics
          </div>
        </div>
      ) : !selCourse ? (
        <div className="card bg-white min-h-[400px] rounded-2xl border border-[var(--border)] shadow-xs flex items-center justify-center">
          <div className="empty-state text-center text-[var(--muted)]">
            <div className="empty-state-icon text-3xl mb-2">📚</div>
            {courses.length === 0 ? 'Create a course with the "+ Add" button' : 'Select a course to load study session analytics'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="card bg-white p-6 rounded-2xl border border-[var(--border)] shadow-xs">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <div className="serif text-lg font-bold text-[var(--ink)]">{col?.name}</div>
                <div className="text-[13px] text-[var(--accent)] font-semibold mt-1">{activeCourse.name}</div>
                <div className="text-xs text-[var(--muted)] mt-1">Enrolled registers: {activeCourse.enrolled} students · {entries.length} days logged</div>
              </div>
              <div className="flex gap-2">
                {entries.length > 0 && (
                  <button onClick={downloadCSV} className="py-2 px-4 shadow-sm text-xs font-semibold text-[var(--accent)] border border-[var(--accent)] rounded-lg hover:bg-[var(--accent-soft)] bg-white cursor-pointer">
                    📥 Download CSV Report
                  </button>
                )}
                <button onClick={() => setShowAddEntry(true)} className="py-2 px-4 shadow-sm text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-95 rounded-lg border-0 cursor-pointer">
                  + Log Dispatch Metrics
                </button>
              </div>
            </div>

            {entries.length > 0 && (
              (() => {
                const latest = entries[entries.length - 1];
                const pct = ((latest.users_using / activeCourse.enrolled) * 100).toFixed(1);
                const avg = latest.users_using > 0 ? Math.round((latest.total_hours * 60) / latest.users_using) : 0;
                const prev = entries.length > 1 ? entries[entries.length - 2] : null;

                const prevPct = prev ? parseFloat(((prev.users_using / activeCourse.enrolled) * 100).toFixed(1)) : null;
                const prevAvg = prev && prev.users_using > 0 ? Math.round((prev.total_hours * 60) / prev.users_using) : null;
                const pctChange = prevPct !== null ? (parseFloat(pct) - prevPct).toFixed(1) : null;
                const avgChange = prevAvg !== null ? (avg - prevAvg) : null;

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginTop: '18px' }}>
                    <div style={{ padding: '12px', background: 'var(--surface-alt)', border: '1px solid border-soft', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Students</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>{latest.users_using}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>out of {activeCourse.enrolled}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--surface-alt)', border: '1px solid border-soft', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Participation %</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: parseFloat(pct) >= 80 ? '#067647' : parseFloat(pct) >= 50 ? '#B54708' : '#B42318', marginTop: '4px' }}>{pct}%</div>
                      {pctChange !== null && <div style={{ fontSize: '11px', color: parseFloat(pctChange) >= 0 ? '#067647' : '#B42318', fontWeight: 600 }}>{parseFloat(pctChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(pctChange))}% change</div>}
                    </div>
                    <div style={{ padding: '12px', background: 'var(--surface-alt)', border: '1px solid border-soft', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Total Hours Study</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>{latest.total_hours.toFixed(0)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>hours total</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--surface-alt)', border: '1px solid border-soft', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Avg Study Time</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: avg >= 120 ? '#067647' : avg >= 45 ? '#B54708' : '#B42318', marginTop: '4px' }}>{avg}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>mins per student {avgChange !== null && <span style={{ color: avgChange >= 0 ? '#067647' : '#B42318', fontWeight: 600 }}>{avgChange >= 0 ? '↑' : '↓'} {Math.abs(avgChange)}</span>}</div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {showAddEntry && (
            <div className="card bg-white p-6 rounded-2xl border-2 border-[var(--accent)] shadow-sm">
              <div className="font-semibold text-[var(--ink)] text-sm mb-3">Record Daily Portal Telemetry</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" style={inp} value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>No. students logged in</label>
                  <input type="number" style={inp} placeholder="e.g., 340" value={newEntry.users_using} onChange={e => setNewEntry({ ...newEntry, users_using: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Sum Total Study Hours</label>
                  <input type="number" step="0.1" style={inp} placeholder="e.g., 185.5" value={newEntry.total_hours} onChange={e => setNewEntry({ ...newEntry, total_hours: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Event Marker (WABA nudge, etc.)</label>
                  <input style={inp} placeholder="e.g. WhatsApp Blast C1" value={newEntry.event} onChange={e => setNewEntry({ ...newEntry, event: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowAddEntry(false);
                    setNewEntry({ date: '', users_using: '', total_hours: '', event: '' });
                  }}
                  className="py-1.5 px-3 border border-gray-300 rounded-md bg-white text-xs font-semibold text-[var(--muted)] cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button onClick={addEntry} className="py-1.5 px-4 bg-[var(--accent)] text-white hover:opacity-95 font-semibold text-xs border-0 rounded-md cursor-pointer">
                  Save Logs
                </button>
              </div>
            </div>
          )}

          <div className="card bg-white p-0 rounded-2xl border border-[var(--border-soft)] shadow-sm overflow-hidden">
            {entries.length === 0 ? (
              <div className="empty-state text-center py-12 text-[var(--muted)]">
                <div className="empty-state-icon text-3xl mb-2">📊</div>No logs entered for this subject. Save logs to initiate charts!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full border-collapse text-left text-[12px] bg-white text-[var(--ink)]">
                  <thead>
                    <tr className="bg-[var(--surface-alt)] border-b border-[var(--border)]">
                      <th className="py-3 px-4 font-semibold text-[var(--muted)] border-b border-[var(--border)] text-left sticky left-0 bg-[var(--surface-alt)] z-10 w-[200px]">Metric</th>
                      {entries.map(e => (
                        <th key={e.id} className="py-3 px-3 font-semibold text-[var(--ink)] border-b border-[var(--border)] text-center min-w-[90px] whitespace-nowrap">
                          {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="py-2.5 px-4 font-semibold text-[var(--ink-soft)] sticky left-0 bg-white z-10">Total Enrolled</td>
                      {entries.map(e => <td key={e.id} className="py-2.5 px-3 text-center">{activeCourse.enrolled}</td>)}
                    </tr>
                    <tr className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="py-2.5 px-4 font-semibold text-[var(--ink-soft)] sticky left-0 bg-white z-10">Currently Logging Study</td>
                      {entries.map(e => <td key={e.id} className="py-2.5 px-3 text-center font-medium">{e.users_using}</td>)}
                    </tr>
                    <tr className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="py-2.5 px-4 font-semibold text-[var(--ink-soft)] sticky left-0 bg-white z-10">Total Hours</td>
                      {entries.map(e => <td key={e.id} className="py-2.5 px-3 text-center">{e.total_hours.toFixed(1)}</td>)}
                    </tr>
                    <tr className="bg-yellow-50/50 hover:bg-yellow-50 border-b border-gray-100">
                      <td className="py-2.5 px-4 font-bold text-[var(--ink-soft)] sticky left-0 bg-yellow-50/50 z-10">% Users</td>
                      {entries.map(e => {
                        const pct = ((e.users_using / activeCourse.enrolled) * 100).toFixed(1);
                        return (
                          <td key={e.id} className="py-2.5 px-3 text-center font-bold" style={{ color: parseFloat(pct) >= 80 ? '#067647' : parseFloat(pct) >= 50 ? '#B54708' : '#B42318' }}>
                            {pct}%
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-yellow-50/50 hover:bg-yellow-50 border-b border-gray-100">
                      <td className="py-2.5 px-4 font-bold text-[var(--ink-soft)] sticky left-0 bg-yellow-50/50 z-10">Avg / User (mins)</td>
                      {entries.map(e => {
                        const avg = e.users_using > 0 ? Math.round((e.total_hours * 60) / e.users_using) : 0;
                        return (
                          <td key={e.id} className="py-2.5 px-3 text-center font-bold" style={{ color: avg >= 120 ? '#067647' : avg >= 45 ? '#B54708' : '#B42318' }}>
                            {avg}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="py-2.5 px-4 font-medium text-[var(--muted)] sticky left-0 bg-white z-10 italic">Campaign note</td>
                      {entries.map(e => (
                        <td key={e.id} className="py-2.5 px-3 text-center text-[var(--accent)] font-semibold text-[10px]">
                          {e.event || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b-0">
                      <td className="py-2 px-4 sticky left-0 bg-white z-10"></td>
                      {entries.map(e => (
                        <td key={e.id} className="py-2 px-3 text-center">
                          <button onClick={() => deleteEntry(e.id)} style={{ padding: 0 }} className="text-red-500 font-semibold hover:text-red-700 bg-none border-none text-[10.5px] cursor-pointer">
                            Remove
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
