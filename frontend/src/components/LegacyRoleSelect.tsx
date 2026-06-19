import { ROLES } from '../constants/roles';

interface LegacyRoleSelectProps {
  onSelect: (role: string) => void;
}

export function LegacyRoleSelect({ onSelect }: LegacyRoleSelectProps) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {Object.entries(ROLES).map(([key, role]) => (
        <button
          key={key}
          className="role-card"
          onClick={() => onSelect(key)}
          style={{ borderLeft: `4px solid ${role.color}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{role.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{role.label}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{role.desc}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
