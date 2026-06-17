interface TaskCardProps {
  icon: string;
  name: string;
  meta: string;
  action?: string;
  onClick?: () => void;
}

export function TaskCard({ icon, name, meta, action, onClick }: TaskCardProps) {
  return (
    <button className="task-card" onClick={onClick}>
      <div className="task-icon">{icon}</div>
      <div className="task-info">
        <div className="task-name">{name}</div>
        <div className="task-meta">{meta}</div>
      </div>
      {action && <div className="task-action">{action}</div>}
    </button>
  );
}
