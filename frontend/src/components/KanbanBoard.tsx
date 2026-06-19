import { useState } from 'react';
import type { College } from '../types/college.types';

export interface KanbanColumnData {
  title: string;
  colleges: College[];
}

interface KanbanCardProps {
  college: College;
  onSelect: (id: string) => void;
}

export function KanbanCard({ college, onSelect }: KanbanCardProps) {
  return (
    <button className="kanban-card" onClick={() => onSelect(college.id)}>
      <strong>{college.name}</strong>
      <small>{college.location || college.contact_name || 'Location not added'}</small>
    </button>
  );
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  onSelect: (id: string) => void;
  initialLimit?: number;
}

export function KanbanColumn({ column, onSelect, initialLimit = 4 }: KanbanColumnProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? column.colleges : column.colleges.slice(0, initialLimit);
  const remaining = column.colleges.length - visible.length;

  return (
    <section className="kanban-column">
      <div className="kanban-column-header">
        <span>{column.title}</span>
        <span className="kanban-count">{column.colleges.length}</span>
      </div>
      <div className="kanban-list">
        {visible.map(college => <KanbanCard key={college.id} college={college} onSelect={onSelect} />)}
        {column.colleges.length === 0 && <div className="state-message">No colleges</div>}
        {column.colleges.length > initialLimit && (
          <button className="kanban-more" onClick={() => setExpanded(value => !value)}>
            {expanded ? 'Show less' : `+ ${remaining} more`}
          </button>
        )}
      </div>
    </section>
  );
}

interface KanbanBoardProps {
  columns: KanbanColumnData[];
  onSelect: (id: string) => void;
}

export function KanbanBoard({ columns, onSelect }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {columns.map(column => <KanbanColumn key={column.title} column={column} onSelect={onSelect} />)}
    </div>
  );
}
