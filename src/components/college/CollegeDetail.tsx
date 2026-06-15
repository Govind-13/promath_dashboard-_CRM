import React, { useState } from 'react';
import { College, StageStatus, StageData } from '../../types';
import { STAGES, ROLES } from '../../constants';

interface CollegeDetailProps {
  college: College;
  role: string;
  onBack: () => void;
  updateCollege: (id: string, fn: (c: College) => College) => void;
  addNotif: (notif: { role: string; message: string }) => void;
}

const getStageIdx = (c: College) => {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (c.stages[STAGES[i].id]?.status === 'completed') idx = i + 1;
    else break;
  }
  return Math.min(idx, STAGES.length - 1);
};

const getProgress = (c: College) => {
  const done = STAGES.filter(s => c.stages[s.id]?.status === 'completed').length;
  return Math.round((done / STAGES.length) * 100);
};

const formatDate = (iso: string | null) => {
  return iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};

export const CollegeDetail: React.FC<CollegeDetailProps> = ({ college, role, onBack, updateCollege, addNotif }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const p = getProgress(college);
  const curIdx = getStageIdx(college);

  const canEdit = (s: typeof STAGES[0]) => {
    return role === 'admin' || s.team === role;
  };

  const updateStage = (sid: string, updates: Partial<StageStatus>) => {
    updateCollege(college.id, c => ({
      ...c,
      stages: {
        ...c.stages,
        [sid]: {
          ...(c.stages[sid] || { status: 'not_started', data: {}, completed_at: null }),
          ...updates
        }
      }
    }));
  };

  const completeStage = (sid: string, data: StageData, msg?: string) => {
    updateStage(sid, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      data: { ...(college.stages[sid]?.data || {}), ...data }
    });
    if (msg && role !== 'admin') {
      addNotif({ role: 'admin', message: `${college.name}: ${msg}` });
    }
    setExpanded(null);
  };

  return (
    <div className="fade-in">
      <button 
        className="mb-[18px] py-1 px-3 border border-[var(--border)] rounded-lg text-sm text-[var(--muted)] hover:bg-[#F2F4F7] bg-white transition duration-150 cursor-pointer font-medium" 
        onClick={onBack}
      >
        ← Back
      </button>
      
      <div className="flex justify-between items-start gap-4 flex-wrap mb-[22px] bg-white border border-[var(--border)] rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink)] mb-2 leading-tight">{college.name}</h1>
          <div className="flex flex-wrap gap-4 text-[13px] text-[var(--ink-soft)] font-medium">
            <span>👤 {college.contact_name} · {college.contact_designation}</span>
            <span>📍 {college.location}</span>
            {college.phone && <span>📞 {college.phone}</span>}
            {college.email && <span>✉️ {college.email}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-[42px] font-bold text-[var(--accent)] leading-none">{p}%</div>
          <div className="text-[11px] text-[var(--muted)] mt-1 font-semibold uppercase tracking-wider">Complete</div>
        </div>
      </div>

      <div className="h-[7px] bg-gray-200 rounded-full overflow-hidden mb-6">
        <div style={{ width: p + '%' }} className="h-full bg-gradient-to-r from-[var(--accent)] to-[#2E90FA] transition-all duration-500 rounded-full"></div>
      </div>

      {/* Regional Tracking & Status Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">📋 Regional Status / Location Track</div>
          </div>
          <textarea 
            value={college.current_status || ''} 
            onChange={e => updateCollege(college.id, c => ({ ...c, current_status: e.target.value }))}
            className="w-full min-h-[70px] p-3 border border-[var(--border)] rounded-xl text-[12px] bg-white text-[var(--ink)] outline-none resize-y leading-relaxed"
            placeholder="Enter current regional pipeline status of this college..." 
          />
        </div>
        <div className="card p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">💬 Additional Feedback & Comments</div>
          </div>
          <textarea 
            value={college.additional_comments || ''} 
            onChange={e => updateCollege(college.id, c => ({ ...c, additional_comments: e.target.value }))}
            className="w-full min-h-[70px] p-3 border border-[var(--border)] rounded-xl text-[12px] bg-white text-[var(--ink)] outline-none resize-y leading-relaxed"
            placeholder="Add any internal administrative comments or notes..." 
          />
        </div>
      </div>

      <div className="card p-0 bg-white border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-[18px] px-6 border-b border-[var(--border)] bg-[var(--surface-alt)]">
          <div className="font-serif text-[19px] font-semibold text-[var(--ink)]">Pipeline Stages</div>
          <div className="text-[12px] text-[var(--muted)] mt-1">
            {role === 'admin' ? 'Click any stage to view or update specifications' : 'You can edit stages assigned to ' + ROLES[role as keyof typeof ROLES]?.label}
          </div>
        </div>

        {STAGES.map((s, idx) => {
          const sd = college.stages[s.id] || { status: 'not_started', completed_at: null, data: {} };
          const isExp = expanded === s.id;
          const done = sd.status === 'completed';
          const prog = sd.status === 'in_progress';
          const cur = idx === curIdx;
          const ce = canEdit(s);

          return (
            <div key={s.id} className="stage-row border-b border-[var(--border-soft)] last:border-b-0">
              <button 
                className={`stage-btn w-full flex items-center gap-4 py-4 px-6 text-left transition-colors duration-150 ${cur && !done ? 'bg-[var(--accent-soft)]' : 'bg-transparent hover:bg-[var(--surface-alt)]'}`}
                onClick={() => setExpanded(isExp ? null : s.id)}
              >
                <div 
                  className={`stage-icon-circle w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${done ? 'bg-[#067647] text-white' : prog ? 'bg-[#B54708] text-white' : 'bg-[var(--surface-alt)] text-gray-500'}`}
                >
                  {done ? '✓' : prog ? '⏳' : s.icon}
                </div>
                <div className="flex-1 min-width-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="stage-name font-semibold text-sm text-[var(--ink)]">{s.label}</span>
                    <span 
                      className="stage-team text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                      style={{ color: ROLES[s.team as keyof typeof ROLES]?.color, background: ROLES[s.team as keyof typeof ROLES]?.bg }}
                    >
                      {s.team === 'admin' ? 'Sales' : s.team}
                    </span>
                  </div>
                  <div className="stage-meta text-[11px] text-[var(--muted)] mt-1 font-medium">
                    {done && `Completed on ${formatDate(sd.completed_at)}`}
                    {prog && 'In progress'}
                    {!done && !prog && 'Not started'}
                  </div>
                </div>
                <span className="text-[var(--muted)] text-base font-bold">{isExp ? '▾' : '›'}</span>
              </button>

              {isExp && (
                <div className="stage-editor bg-[var(--surface-alt)] px-6 pb-6 pt-2 pl-[76px]">
                  <StageEditor 
                    stage={s} 
                    stageData={sd} 
                    college={college} 
                    canEdit={ce} 
                    onUpdate={(u) => updateStage(s.id, u)} 
                    onComplete={(d, m) => completeStage(s.id, d, m)} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ STAGE FORM COMPONENT ============
const StageEditor: React.FC<{
  stage: typeof STAGES[0];
  stageData: StageStatus;
  college: College;
  canEdit: boolean;
  onUpdate: (u: Partial<StageStatus>) => void;
  onComplete: (d: StageData, m?: string) => void;
}> = ({ stage, stageData, college, canEdit, onUpdate, onComplete }) => {
  const [form, setForm] = useState<StageData>(stageData.data || {});
  const upd = (k: keyof StageData, v: any) => setForm(p => ({ ...p, [k]: v }));

  if (!canEdit && stageData.status !== 'completed') {
    return (
      <div className="stage-editor-inner p-4 bg-white rounded-xl border border-[var(--border-soft)]">
        <div className="text-[13px] text-[var(--muted)] font-medium">Managed by {ROLES[stage.team as keyof typeof ROLES]?.label}. View-only.</div>
      </div>
    );
  }

  const renderForm = () => {
    switch (stage.id) {
      case 'initial_meeting':
        return (
          <>
            <Field label="Meeting Date" type="date" v={form.date} on={v => upd('date', v)} d={!canEdit} />
            <Field label="Attendees" v={form.attendees} on={v => upd('attendees', v)} ph="e.g., Principal, HOD-Maths" d={!canEdit} />
            <Field label="Meeting Notes" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
          </>
        );
      case 'product_demo':
        return (
          <>
            <Field label="Demo Date" type="date" v={form.date} on={v => upd('date', v)} d={!canEdit} />
            <Field label="Attendees" v={form.attendees} on={v => upd('attendees', v)} ph="e.g., Principal, HOD-Maths, Faculty" d={!canEdit} />
            <Field label="Demo Outcome / Feedback" type="textarea" v={form.outcome} on={v => upd('outcome', v)} ph="How did the demo go?" d={!canEdit} />
            <div className="mt-2">
              <div className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Follow-up Complete?</div>
              <div className="flex gap-2">
                {['yes', 'no'].map(opt => (
                  <button 
                    key={opt} 
                    disabled={!canEdit} 
                    onClick={() => upd('followup_done', opt)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-semibold transition cursor-pointer ${
                      form.followup_done === opt 
                        ? (opt === 'yes' ? 'border-[#067647] bg-[#ECFDF3] text-[#067647]' : 'border-[#B42318] bg-[#FEF3F2] text-[#B42318]')
                        : 'border-[var(--border)] bg-white text-[var(--muted)]'
                    }`}
                  >
                    {opt === 'yes' ? '✅ Yes' : '✕ No'}
                  </button>
                ))}
              </div>
            </div>
            {form.followup_done === 'yes' && (
              <div className="mt-3 p-4 bg-[#ECFDF3] border border-[#A2E9C1] rounded-xl">
                <Field label="Follow-up Details" type="textarea" v={form.followup_comment} on={v => upd('followup_comment', v)} ph="What details were shared in follow up?" d={!canEdit} />
              </div>
            )}
            {form.followup_done === 'no' && (
              <div className="mt-3 p-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-xl">
                <Field label="Reason for Skipping Follow-up *" type="textarea" v={form.followup_reason} on={v => upd('followup_reason', v)} ph="Details on lack of follow back (e.g. out of station, lack of funds)" d={!canEdit} />
              </div>
            )}
          </>
        );
      case 'demo_followup':
        return (
          <>
            <Field label="Follow-up Date" type="date" v={form.date} on={v => upd('date', v)} d={!canEdit} />
            <Field label="Feedback / Outcome" type="textarea" v={form.feedback} on={v => upd('feedback', v)} ph="What did management say?" d={!canEdit} />
          </>
        );
      case 'pricing_negotiation':
        return (
          <>
            <Field label="Price per Student (₹)" type="number" v={form.agreed_price} on={v => upd('agreed_price', v)} d={!canEdit} />
            <Field label="Total Student Strength" type="number" v={form.total_students || college.total_students} on={v => upd('total_students', v)} d={!canEdit} />
            <Field label="Total Deal Value (₹)" type="number" v={form.total_value} on={v => upd('total_value', v)} d={!canEdit} />
            <Field label="Negotiation Notes" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
          </>
        );
      case 'mou_signing':
        return (
          <>
            <Field label="MOU Execution Date" type="date" v={form.mou_date} on={v => upd('mou_date', v)} d={!canEdit} />
            <Field label="Signed MOU Document Drive Link" v={form.mou_link} on={v => upd('mou_link', v)} ph="Paste signed doc Google Drive link" d={!canEdit} />
            <Field label="Notes" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
          </>
        );
      case 'syllabus_submission':
        return <SyllabusForm form={form} upd={upd} canEdit={canEdit} />;
      case 'coverage_check':
        return <CoverageForm form={form} upd={upd} canEdit={canEdit} college={college} />;
      case 'coverage_communication':
        return (
          <>
            <Field label="Communicated on" type="date" v={form.communicated_at} on={v => upd('communicated_at', v)} d={!canEdit} />
            <Field label="Target Implementation Date" type="date" v={form.target_impl_date} on={v => upd('target_impl_date', v)} d={!canEdit} />
          </>
        );
      case 'student_data':
        return (
          <>
            <div className="p-3 bg-[#FFFAEB] border border-[#FEDF89] rounded-xl text-xs text-[#B54708] font-medium mb-3">
              College team sends student registers. Log count and folder link.
            </div>
            <Field label="Total Students Received" type="number" v={form.student_count} on={v => upd('student_count', v)} d={!canEdit} />
            <Field label="Student registers folder / sheet link" v={form.file_link} on={v => upd('file_link', v)} ph="Google sheets / xlsx link" d={!canEdit} />
            <Field label="Notes" type="textarea" v={form.notes} on={v => upd('notes', v)} ph="Are there missing columns/data fields?" d={!canEdit} />
          </>
        );
      case 'license_creation':
        return (
          <>
            <Field label="Licenses Needed" type="number" v={form.total_licenses || college.stages.student_data?.data?.student_count} on={v => upd('total_licenses', v)} d={!canEdit} />
            <Field label="Licenses Generated / Created" type="number" v={form.licenses_created} on={v => upd('licenses_created', v)} d={!canEdit} />
            <Field label="Creator Notes" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
          </>
        );
      case 'impl_confirmation':
        return (
          <>
            <Field label="Confirmed Rollout Date" type="date" v={form.confirmed_date} on={v => upd('confirmed_date', v)} d={!canEdit} />
            <Field label="Implementation Team Handlers" v={form.team_members} on={v => upd('team_members', v)} ph="e.g., Ravi, Shreya" d={!canEdit} />
            <Field label="Pre-requisites checked notes" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
          </>
        );
      case 'implementation':
        return (
          <>
            <Field label="Actual Rollout Date" type="date" v={form.actual_date} on={v => upd('actual_date', v)} d={!canEdit} />
            <Field label="Executed deployment team" v={form.team_members} on={v => upd('team_members', v)} d={!canEdit} />
            <Field label="Rollout / Setup Logs" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
          </>
        );
      case 'impl_feedback':
        return (
          <>
            <Field label="Service Delivery Quality" type="select" options={['Excellent', 'Good', 'Average', 'Issues Faced']} v={form.quality} on={v => upd('quality', v)} d={!canEdit} />
            <Field label="Major Issues / Friction points" type="textarea" v={form.issues} on={v => upd('issues', v)} d={!canEdit} />
            <Field label="Detailed feedback log" type="textarea" v={form.feedback} on={v => upd('feedback', v)} d={!canEdit} />
          </>
        );
      case 'orientation': {
        const total = college.stages.student_data?.data?.student_count || college.total_students || 0;
        return (
          <>
            <Field label="Onboarding Date" type="date" v={form.start_date} on={v => upd('start_date', v)} d={!canEdit} />
            <Field label="Students Successfully Onboarded" type="number" v={form.students_onboarded} on={v => upd('students_onboarded', v)} ph={'Out of ' + total} d={!canEdit} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Credentials via Email" type="number" v={form.credentials_sent_email} on={v => upd('credentials_sent_email', v)} d={!canEdit} />
              <Field label="Credentials via WhatsApp" type="number" v={form.credentials_sent_whatsapp} on={v => upd('credentials_sent_whatsapp', v)} d={!canEdit} />
            </div>
            <Field label="Onboarding / Orientation remarks" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
          </>
        );
      }
      default:
        return null;
    }
  };

  const msgs = {
    syllabus_submission: 'Syllabus uploaded — assigned to Content Team',
    coverage_check: 'Syllabus coverage review completed by Content Team',
    student_data: 'Student registers collection complete — assigned to Implementation Team',
    license_creation: 'Student user login credentials generated successfully',
    impl_confirmation: 'Interactive rollout confirmation date finalized',
    implementation: 'Campus sandbox / deployment rollout executed',
    impl_feedback: 'Implementation quality feedback captured. Handed off to Engagement!',
    orientation: 'Onboarding orientation session completed. College is live! 🎉',
  };

  return (
    <div className="stage-editor-inner p-5 bg-white border border-[var(--border-soft)] rounded-xl mt-2 flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {renderForm()}
      </div>

      {canEdit && stageData.status !== 'completed' && (
        <div className="flex gap-2 flex-wrap mt-[18px]">
          {stageData.status === 'not_started' && (
            <button 
              className="py-2.5 px-4 font-semibold text-xs border border-[var(--border)] bg-gray-50 text-[var(--ink-soft)] rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => onUpdate({ status: 'in_progress', data: form })}
            >
              Mark In Progress
            </button>
          )}
          <button 
            className="py-2.5 px-5 font-semibold text-xs text-white bg-[var(--accent)] rounded-lg hover:bg-opacity-95 cursor-pointer shadow-indigo-100"
            onClick={() => onComplete(form, msgs[stage.id as keyof typeof msgs])}
          >
            Mark Completed
          </button>
          <button 
            className="py-2.5 px-4 font-semibold text-xs border border-[var(--border)] bg-white text-[var(--muted)] rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
            onClick={() => onUpdate({ data: form })}
          >
            Save Draft
          </button>
        </div>
      )}

      {stageData.status === 'completed' && (
        <div className="mt-4 p-3 bg-[#ECFDF3] border border-[#A2E9C1] rounded-xl text-xs text-[#067647] font-semibold">
          ✓ Handled & Completed on {formatDate(stageData.completed_at)}
        </div>
      )}
    </div>
  );
};

// ============ REUSABLE FIELD WRAPPER ============
const Field: React.FC<{
  label: string;
  type?: string;
  v?: any;
  on: (val: any) => void;
  ph?: string;
  options?: string[];
  d?: boolean;
}> = ({ label, type, v, on, ph, options, d }) => {
  return (
    <div className="w-full">
      <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">{label}</label>
      {type === 'textarea' ? (
        <textarea 
          className="w-full p-3 border border-gray-300 focus:border-[var(--accent)] focus:ring-[var(--accent)] rounded-xl text-sm bg-white text-[var(--ink)] outline-none resize-y min-h-[60px]"
          rows={3} 
          value={v || ''} 
          onChange={e => on(e.target.value)} 
          placeholder={ph} 
          disabled={d} 
        />
      ) : type === 'select' ? (
        <select 
          className="w-full min-h-[42px] p-3 border border-gray-300 focus:border-[var(--accent)] focus:ring-[var(--accent)] rounded-xl text-sm bg-white text-[var(--ink)] outline-none"
          value={v || ''} 
          onChange={e => on(e.target.value)} 
          disabled={d}
        >
          <option value="">Select Option…</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input 
          className="w-full min-h-[42px] px-3.5 border border-gray-300 focus:border-[var(--accent)] focus:ring-[var(--accent)] rounded-xl text-sm bg-white text-[var(--ink)] outline-none"
          type={type || 'text'} 
          value={v || ''} 
          onChange={e => on(e.target.value)} 
          placeholder={ph} 
          disabled={d} 
        />
      )}
    </div>
  );
};

const SyllabusForm: React.FC<{
  form: StageData;
  upd: (fk: keyof StageData, val: any) => void;
  canEdit: boolean;
}> = ({ form, upd, canEdit }) => {
  const units = form.units || [];
  const addU = () => upd('units', [...units, { name: 'Unit ' + (units.length + 1), topics: '' }]);
  const updU = (i: number, k: 'name' | 'topics', val: string) => {
    upd('units', units.map((u, j) => j === i ? { ...u, [k]: val } : u));
  };
  const rmU = (i: number) => upd('units', units.filter((_, j) => j !== i));

  return (
    <>
      <Field label="Target Subject" v={form.subject} on={v => upd('subject', v)} ph="e.g., Matrices and Calculus" d={!canEdit} />
      <Field label="Target Semester" v={form.semester} on={v => upd('semester', v)} ph="e.g., Sem 1" d={!canEdit} />
      <div>
        <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2 block">Upload Syllabus Units</label>
        {units.map((u, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input 
              className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[var(--ink)] outline-none flex-1" 
              value={u.name} 
              onChange={e => updU(i, 'name', e.target.value)} 
              placeholder="Unit identifier" 
              disabled={!canEdit} 
            />
            <input 
              className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[var(--ink)] outline-none flex-2" 
              value={u.topics} 
              onChange={e => updU(i, 'topics', e.target.value)} 
              placeholder="Syllabus topics (eg. linear algebra, eigenvalues)" 
              disabled={!canEdit} 
            />
            {canEdit && (
              <button onClick={() => rmU(i)} className="p-2.5 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm font-bold cursor-pointer hover:bg-red-100 flex-shrink-0">
                ×
              </button>
            )}
          </div>
        ))}
        {canEdit && (
          <button onClick={addU} className="py-2 px-4 border border-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-lg text-xs font-semibold text-[var(--accent)] mt-1.5 cursor-pointer">
            + Add Unit
          </button>
        )}
      </div>
      <Field label="Special remarks / instructions for Content Team" type="textarea" v={form.notes_for_content} on={v => upd('notes_for_content', v)} d={!canEdit} />
    </>
  );
};

const CoverageForm: React.FC<{
  form: StageData;
  upd: (fk: keyof StageData, val: any) => void;
  canEdit: boolean;
  college: College;
}> = ({ form, upd, canEdit, college }) => {
  const units = college.stages.syllabus_submission?.data?.units || [];
  const cov = form.unit_coverage || units.map(u => ({ unit: u.name, pct: 0, notes: '' }));

  const updC = (i: number, k: 'pct' | 'notes', val: any) => {
    const nc = cov.map((c, j) => j === i ? { ...c, [k]: val } : c);
    upd('unit_coverage', nc);
    if (k === 'pct') {
      const parsed = parseFloat(val) || 0;
      const t = Math.round(nc.reduce((s, item) => s + (parseFloat(item.pct as any) || 0), 0) / nc.length);
      upd('total_coverage', t);
    }
  };

  return (
    <>
      <div className="p-3 bg-[#EFF4FF] border border-[#B2CCFF] rounded-xl text-xs text-[#175CD3] font-medium mb-2 leading-relaxed">
        Verify the uploaded syllabus topics against Promath's digital resource curriculum library and indicate coverage percentage index below.
      </div>

      {units.length === 0 ? (
        <div className="py-4 text-center text-sm font-medium text-[var(--muted)]">No syllabus uploaded by sales team yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">Unit Coverage Breakdown</label>
          {units.map((u, i) => {
            const check = cov[i] || { pct: 0, notes: '' };
            return (
              <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="min-width-0 flex-1">
                    <div className="font-semibold text-xs text-[var(--ink)]">{u.name}</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5 mt-1">{u.topics}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      className="p-1 px-2 border border-gray-300 rounded text-center w-14 font-semibold text-xs outline-none bg-white text-[var(--ink)] focus:border-[var(--accent)]" 
                      value={check.pct} 
                      onChange={e => updC(i, 'pct', e.target.value)} 
                      disabled={!canEdit} 
                    />
                    <span className="text-xs font-semibold text-[var(--muted)]">%</span>
                  </div>
                </div>
                <input 
                  className="w-full py-1.5 px-3 border border-gray-200 bg-white text-[11px] rounded-lg outline-none focus:border-[var(--accent)]" 
                  value={check.notes || ''} 
                  onChange={e => updC(i, 'notes', e.target.value)} 
                  placeholder="Notes regarding alternatives / coverage gaps..." 
                  disabled={!canEdit} 
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 bg-[#ECFDF3] border border-[#A2E9C1] rounded-2xl flex justify-between items-center shadow-xs">
        <div className="text-xs font-bold text-[#067647] uppercase tracking-wider">Overall Platform Coverage</div>
        <div className="font-serif text-2xl font-bold text-[#067647]">{form.total_coverage || 0}%</div>
      </div>
      <Field label="Overall comments regarding mapping alignment" type="textarea" v={form.notes} on={v => upd('notes', v)} d={!canEdit} />
    </>
  );
};
