import React, { useState, useEffect } from 'react';
import type { College, StageData } from '../../types/college.types';
import type { Stage } from '../../constants/stages';
import SyllabusForm from './SyllabusForm';
import CoverageForm from './CoverageForm';

interface Props {
  stage: Stage;
  stageData: StageData;
  college: College;
  canEdit: boolean;
  onUpdate: (data: Record<string, unknown>) => void;
  onComplete: () => void;
}

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; disabled: boolean; type?: string; rows?: number; placeholder?: string }> = ({ label, value, onChange, disabled, type, rows, placeholder }) => (
  <div className="field">
    <label className="label">{label}</label>
    {rows ? (
      <textarea className="input" rows={rows} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} />
    ) : (
      <input className="input" type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} />
    )}
  </div>
);

const StageEditor: React.FC<Props> = ({ stage, stageData, college, canEdit, onUpdate, onComplete }) => {
  const [form, setForm] = useState<Record<string, unknown>>(stageData.data || {});

  useEffect(() => { setForm(stageData.data || {}); }, [stageData]);

  const upd = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const f = (k: string) => (form[k] as string) || '';
  const completed = stageData.status === 'completed';
  const editable = canEdit && !completed;

  const saveDraft = () => onUpdate(form);
  const markInProgress = () => { onUpdate(form); };
  const markCompleted = () => { onUpdate(form); onComplete(); };

  const renderFields = () => {
    switch (stage.id) {
      case 'initial_meeting':
        return (<>
          <Field label="Meeting Date" value={f('date')} onChange={v => upd('date', v)} disabled={!editable} type="date" />
          <Field label="Attendees" value={f('attendees')} onChange={v => upd('attendees', v)} disabled={!editable} placeholder="Who attended the meeting" />
          <Field label="Notes" value={f('notes')} onChange={v => upd('notes', v)} disabled={!editable} rows={3} placeholder="Meeting notes" />
        </>);
      case 'product_demo':
        return (<>
          <Field label="Demo Date" value={f('demo_date')} onChange={v => upd('demo_date', v)} disabled={!editable} type="date" />
          <Field label="Presenter" value={f('presenter')} onChange={v => upd('presenter', v)} disabled={!editable} placeholder="Who presented" />
          <Field label="Products Shown" value={f('products_shown')} onChange={v => upd('products_shown', v)} disabled={!editable} placeholder="Which products were demoed" />
          <Field label="Feedback" value={f('feedback')} onChange={v => upd('feedback', v)} disabled={!editable} rows={3} placeholder="College feedback" />
        </>);
      case 'demo_followup':
        return (<>
          <Field label="Follow-up Date" value={f('followup_date')} onChange={v => upd('followup_date', v)} disabled={!editable} type="date" />
          <Field label="Follow-up Mode" value={f('mode')} onChange={v => upd('mode', v)} disabled={!editable} placeholder="Call / Email / Visit" />
          <Field label="Interest Level" value={f('interest_level')} onChange={v => upd('interest_level', v)} disabled={!editable} placeholder="High / Medium / Low" />
          <Field label="Next Steps" value={f('next_steps')} onChange={v => upd('next_steps', v)} disabled={!editable} rows={2} placeholder="Agreed next steps" />
        </>);
      case 'pricing_negotiation':
        return (<>
          <Field label="Agreed Price (per student)" value={f('agreed_price')} onChange={v => upd('agreed_price', v)} disabled={!editable} type="number" placeholder="Price per student" />
          <Field label="Total Students" value={f('total_students')} onChange={v => upd('total_students', v)} disabled={!editable} type="number" />
          <Field label="Total Value" value={f('total_value')} onChange={v => upd('total_value', v)} disabled={!editable} type="number" />
          <Field label="Discount Notes" value={f('discount_notes')} onChange={v => upd('discount_notes', v)} disabled={!editable} rows={2} placeholder="Any discounts or special terms" />
        </>);
      case 'mou_signing':
        return (<>
          <Field label="MOU Date" value={f('mou_date')} onChange={v => upd('mou_date', v)} disabled={!editable} type="date" />
          <Field label="Signatory" value={f('signatory')} onChange={v => upd('signatory', v)} disabled={!editable} placeholder="Who signed from the college" />
          <Field label="Document Link" value={f('doc_link')} onChange={v => upd('doc_link', v)} disabled={!editable} placeholder="Link to signed MOU" />
          <Field label="Notes" value={f('notes')} onChange={v => upd('notes', v)} disabled={!editable} rows={2} />
        </>);
      case 'syllabus_submission':
        return <SyllabusForm form={form} upd={upd} canEdit={editable} />;
      case 'coverage_check':
        return <CoverageForm form={form} upd={upd} canEdit={editable} college={college} />;
      case 'coverage_communication':
        return (<>
          <Field label="Communication Date" value={f('comm_date')} onChange={v => upd('comm_date', v)} disabled={!editable} type="date" />
          <Field label="Coverage %" value={f('coverage_pct')} onChange={v => upd('coverage_pct', v)} disabled={!editable} placeholder="Overall coverage percentage" />
          <Field label="Gaps Identified" value={f('gaps')} onChange={v => upd('gaps', v)} disabled={!editable} rows={3} placeholder="Any coverage gaps" />
          <Field label="College Response" value={f('response')} onChange={v => upd('response', v)} disabled={!editable} rows={2} placeholder="How did the college respond" />
        </>);
      case 'student_data':
        return (<>
          <Field label="Student Count" value={f('student_count')} onChange={v => upd('student_count', v)} disabled={!editable} type="number" />
          <Field label="Data File Link" value={f('file_link')} onChange={v => upd('file_link', v)} disabled={!editable} placeholder="Google Drive / file link" />
          <Field label="Data Format" value={f('format')} onChange={v => upd('format', v)} disabled={!editable} placeholder="Excel / CSV / other" />
          <Field label="Notes" value={f('notes')} onChange={v => upd('notes', v)} disabled={!editable} rows={2} />
        </>);
      case 'license_creation':
        return (<>
          <Field label="Total Licenses" value={f('total_licenses')} onChange={v => upd('total_licenses', v)} disabled={!editable} type="number" />
          <Field label="Licenses Created" value={f('licenses_created')} onChange={v => upd('licenses_created', v)} disabled={!editable} type="number" />
          <Field label="Notes" value={f('notes')} onChange={v => upd('notes', v)} disabled={!editable} rows={2} />
        </>);
      case 'impl_confirmation':
        return (<>
          <Field label="Confirmation Date" value={f('confirm_date')} onChange={v => upd('confirm_date', v)} disabled={!editable} type="date" />
          <Field label="Confirmed By" value={f('confirmed_by')} onChange={v => upd('confirmed_by', v)} disabled={!editable} placeholder="Faculty / HOD name" />
          <Field label="Scheduled Implementation Date" value={f('impl_date')} onChange={v => upd('impl_date', v)} disabled={!editable} type="date" />
          <Field label="Notes" value={f('notes')} onChange={v => upd('notes', v)} disabled={!editable} rows={2} />
        </>);
      case 'implementation':
        return (<>
          <Field label="Implementation Date" value={f('impl_date')} onChange={v => upd('impl_date', v)} disabled={!editable} type="date" />
          <Field label="Sessions Conducted" value={f('sessions')} onChange={v => upd('sessions', v)} disabled={!editable} type="number" />
          <Field label="Students Activated" value={f('students_activated')} onChange={v => upd('students_activated', v)} disabled={!editable} type="number" />
          <Field label="Issues" value={f('issues')} onChange={v => upd('issues', v)} disabled={!editable} rows={3} placeholder="Any issues during implementation" />
        </>);
      case 'impl_feedback':
        return (<>
          <Field label="Feedback Date" value={f('feedback_date')} onChange={v => upd('feedback_date', v)} disabled={!editable} type="date" />
          <Field label="Faculty Feedback" value={f('faculty_feedback')} onChange={v => upd('faculty_feedback', v)} disabled={!editable} rows={3} placeholder="Feedback from faculty" />
          <Field label="Student Feedback" value={f('student_feedback')} onChange={v => upd('student_feedback', v)} disabled={!editable} rows={3} placeholder="Feedback from students" />
          <Field label="Rating (1-5)" value={f('rating')} onChange={v => upd('rating', v)} disabled={!editable} type="number" />
        </>);
      case 'orientation':
        return (<>
          <Field label="Orientation Date" value={f('orientation_date')} onChange={v => upd('orientation_date', v)} disabled={!editable} type="date" />
          <Field label="Mode" value={f('mode')} onChange={v => upd('mode', v)} disabled={!editable} placeholder="Online / Offline / Hybrid" />
          <Field label="Students Attended" value={f('students_attended')} onChange={v => upd('students_attended', v)} disabled={!editable} type="number" />
          <Field label="Topics Covered" value={f('topics_covered')} onChange={v => upd('topics_covered', v)} disabled={!editable} rows={3} placeholder="What was covered in orientation" />
        </>);
      default:
        return <div className="empty-state">No form configured for this stage</div>;
    }
  };

  return (
    <div className="stage-editor">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: completed ? '#2D7A4F' : stageData.status === 'in_progress' ? '#B8410A' : '#6B7280' }}>
          {completed ? '✅ Completed' : stageData.status === 'in_progress' ? '🔄 In Progress' : '⏳ Not Started'}
        </span>
        {stageData.completed_at && (
          <span style={{ fontSize: 11, color: '#6B7280' }}>
            on {new Date(stageData.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {renderFields()}

      {editable && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {stageData.status === 'not_started' && (
            <button className="btn btn-secondary" onClick={markInProgress}>Mark In Progress</button>
          )}
          <button className="btn btn-secondary" onClick={saveDraft}>Save Draft</button>
          <button className="btn btn-primary" onClick={markCompleted}>Mark Completed</button>
        </div>
      )}
    </div>
  );
};

export default StageEditor;
