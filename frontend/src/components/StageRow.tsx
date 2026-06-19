import type { ReactNode } from 'react';
import type { Stage } from '../constants/stages';
import type { StageData } from '../types/college.types';
import { formatDate } from '../utils/college';

interface StageRowProps {
  stage: Stage;
  stageData: StageData;
  open: boolean;
  current: boolean;
  onToggle: () => void;
  children?: ReactNode;
}

export function StageRow({ stage, stageData, open, current, onToggle, children }: StageRowProps) {
  const statusLabel = stageData.status === 'completed' ? 'Completed' : stageData.status === 'in_progress' ? 'In Progress' : 'Not Started';
  const statusClass = stageData.status === 'completed' ? 'pill-success' : stageData.status === 'in_progress' ? 'pill-warning' : '';

  return (
    <div className="stage-row">
      <button className={`stage-row-button ${current ? 'current' : ''}`} onClick={onToggle}>
        <span className={`stage-icon-circle ${stageData.status === 'completed' ? 'completed' : ''}`}>
          {stageData.status === 'completed' ? '✓' : stage.icon}
        </span>
        <span className="stage-row-main">
          <span className="stage-name">{stage.label}</span>
          <span className="stage-meta">{stage.team} team</span>
        </span>
        <span className="stage-row-side">
          <span className={`pill ${statusClass}`}>{statusLabel}</span>
          <span className="stage-date state-message">{formatDate(stageData.completed_at)}</span>
          <span>{open ? '⌃' : '⌄'}</span>
        </span>
      </button>
      {open && <div className="stage-editor"><div className="stage-editor-inner">{children}</div></div>}
    </div>
  );
}
