interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  meta?: string;
  className?: string;
}

export function StatCard({ label, value, icon, meta, className = '' }: StatCardProps) {
  return (
    <article className={`stat-card ${className}`.trim()}>
      <div className="stat-label">{label}</div>
      {icon && <span className="stat-icon" aria-hidden="true">{icon}</span>}
      <div>
        <div className="stat-value">{value}</div>
        {meta && <div className="stat-meta">{meta}</div>}
      </div>
    </article>
  );
}
