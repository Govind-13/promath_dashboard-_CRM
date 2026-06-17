interface StatProps {
  label: string;
  value: string | number;
  icon: string;
  onClick?: () => void;
  active?: boolean;
}

export function Stat({ label, value, icon, onClick, active }: StatProps) {
  const interactive = !!onClick;
  return (
    <div
      className="stat-card"
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } } : undefined}
      style={interactive ? { cursor: 'pointer', borderColor: active ? 'var(--accent)' : 'var(--border)', boxShadow: active ? '0 0 0 2px rgba(23,92,211,0.12)' : 'var(--shadow-xs)' } : undefined}
    >
      <div className="label"><span>{label}</span><span>{icon}</span></div>
      <div className="value">{value}</div>
    </div>
  );
}
