import type { KeyboardEvent } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  meta?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon, meta, className = '', onClick }: StatCardProps) {
  const clickableProps = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        onClick,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <article
      className={`stat-card ${onClick ? 'stat-card-clickable' : ''} ${className}`.trim()}
      {...clickableProps}
    >
      <div className="stat-label">{label}</div>
      {icon && <span className="stat-icon" aria-hidden="true">{icon}</span>}
      <div>
        <div className="stat-value">{value}</div>
        {meta && <div className="stat-meta">{meta}</div>}
      </div>
    </article>
  );
}
