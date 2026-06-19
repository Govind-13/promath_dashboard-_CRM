import { useEffect, useState } from 'react';
import type { College, StageData, StageStatus } from '../../types/college.types';
import { STAGES } from '../../constants/stages';
import { getProgress, getStageIdx } from '../../utils/college';
import StageEditor from './StageEditor';
import { HeaderCard } from '../HeaderCard';
import { StageRow } from '../StageRow';

interface Props {
  college: College;
  role: string;
  onBack: () => void;
  updateCollege: (id: string, fn: (c: College) => College) => void | Promise<void>;
  saveStage: (collegeId: string, stageId: string, data: Record<string, unknown>, status: StageStatus) => void | Promise<void>;
}

const Detail: React.FC<Props> = ({ college, role, onBack, updateCollege, saveStage }) => {
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(college.current_status || '');
  const [comments, setComments] = useState(college.additional_comments || '');
  const progress = getProgress(college);
  const currentStageIndex = getStageIdx(college);
  const canEditCollege = role === 'admin' || role === 'implementation' || role === 'engagement';

  useEffect(() => {
    setCurrentStatus(college.current_status || '');
    setComments(college.additional_comments || '');
  }, [college.id, college.current_status, college.additional_comments]);

  const canEditStage = (stageTeam: string) =>
    role === 'admin' || ((role === 'implementation' || role === 'engagement') && stageTeam === role);

  const updateMeta = (key: 'current_status' | 'additional_comments', value: string) => {
    updateCollege(college.id, current => ({ ...current, [key]: value }));
  };

  return (
    <div className="fade-in page-stack">
      <div><button className="btn btn-secondary" onClick={onBack}>← Back to Colleges</button></div>

      <HeaderCard
        title={college.name}
        subtitle={`${college.contact_name || 'No contact'} · ${college.contact_designation || 'No designation'} · ${college.location || 'No location'}`}
        action={(
          <div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{progress}%</div>
            <div className="state-message">Pipeline Progress</div>
            <div className="progress-bar" style={{ width: 160, marginTop: 5 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      />

      <section className="card form-grid">
        <div className="field">
          <label className="label">Current Status</label>
          <textarea
            className="input"
            rows={3}
            value={currentStatus}
            disabled={!canEditCollege}
            onChange={event => setCurrentStatus(event.target.value)}
            onBlur={() => canEditCollege && updateMeta('current_status', currentStatus)}
            placeholder="Current status notes..."
          />
        </div>
        <div className="field">
          <label className="label">Additional Comments</label>
          <textarea
            className="input"
            rows={3}
            value={comments}
            disabled={!canEditCollege}
            onChange={event => setComments(event.target.value)}
            onBlur={() => canEditCollege && updateMeta('additional_comments', comments)}
            placeholder="Any additional comments..."
          />
        </div>
      </section>

      <section>
        <div className="page-heading" style={{ marginBottom: 14 }}>
          <div>
            <h2>Pipeline Stages</h2>
            <p>Open a stage to review its details or update progress.</p>
          </div>
        </div>
        <div className="stage-list">
          {STAGES.map((stage, index) => {
            const stageData: StageData = college.stages[stage.id] || { status: 'not_started', completed_at: null, data: {} };
            const isOpen = openStage === stage.id;
            return (
              <StageRow
                key={stage.id}
                stage={stage}
                stageData={stageData}
                open={isOpen}
                current={index === currentStageIndex && progress < 100}
                onToggle={() => setOpenStage(isOpen ? null : stage.id)}
              >
                <StageEditor
                  stage={stage}
                  stageData={stageData}
                  college={college}
                  canEdit={canEditStage(stage.team)}
                  onUpdate={(data, status) => saveStage(college.id, stage.id, data, status || stageData.status)}
                />
              </StageRow>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Detail;
