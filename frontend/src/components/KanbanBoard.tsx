import { useState } from 'react';
import type { College } from '../types/college.types';

export interface KanbanColumnData {
  title: string;
  colleges: College[];
}

interface KanbanCardProps {
  college: College;
  onSelect: (id: string) => void;
  onDragStart?: (collegeId: string) => void;
  onDragEnd?: () => void;
  dragging?: boolean;
}

export function KanbanCard({ college, onSelect, onDragStart, onDragEnd, dragging }: KanbanCardProps) {
  return (
    <button
      className={`kanban-card ${dragging ? 'dragging' : ''}`.trim()}
      draggable={!!onDragStart}
      onClick={() => onSelect(college.id)}
      onDragStart={event => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', college.id);
        onDragStart?.(college.id);
      }}
      onDragEnd={onDragEnd}
    >
      <strong>{college.name}</strong>
      <small>{college.location || college.contact_name || 'Location not added'}</small>
    </button>
  );
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  onSelect: (id: string) => void;
  onMove?: (collegeId: string, targetColumn: string) => void;
  draggingId?: string;
  dragOverColumn?: string;
  onDragStart?: (collegeId: string) => void;
  onDragOverColumn?: (column: string) => void;
  onDragEnd?: () => void;
  initialLimit?: number;
}

export function KanbanColumn({
  column,
  onSelect,
  onMove,
  draggingId,
  dragOverColumn,
  onDragStart,
  onDragOverColumn,
  onDragEnd,
  initialLimit = 4,
}: KanbanColumnProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? column.colleges : column.colleges.slice(0, initialLimit);
  const remaining = column.colleges.length - visible.length;

  return (
    <section
      className={`kanban-column ${dragOverColumn === column.title ? 'drag-over' : ''}`.trim()}
      onDragOver={event => {
        if (!onMove) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        onDragOverColumn?.(column.title);
      }}
      onDrop={event => {
        if (!onMove) return;
        event.preventDefault();
        const collegeId = event.dataTransfer.getData('text/plain') || draggingId;
        if (collegeId) onMove(collegeId, column.title);
        onDragEnd?.();
      }}
    >
      <div className="kanban-column-header">
        <span>{column.title}</span>
        <span className="kanban-count">{column.colleges.length}</span>
      </div>
      <div className="kanban-list">
        {visible.map(college => (
          <KanbanCard
            key={college.id}
            college={college}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            dragging={draggingId === college.id}
          />
        ))}
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
  onMove?: (collegeId: string, targetColumn: string) => void;
}

export function KanbanBoard({ columns, onSelect, onMove }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState('');
  const [dragOverColumn, setDragOverColumn] = useState('');
  const clearDrag = () => {
    setDraggingId('');
    setDragOverColumn('');
  };

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <KanbanColumn
          key={column.title}
          column={column}
          onSelect={onSelect}
          onMove={onMove}
          draggingId={draggingId}
          dragOverColumn={dragOverColumn}
          onDragStart={setDraggingId}
          onDragOverColumn={setDragOverColumn}
          onDragEnd={clearDrag}
        />
      ))}
    </div>
  );
}
