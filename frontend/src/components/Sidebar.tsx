import { ROLES } from '../constants/roles';

interface SidebarProps {
  role: string;
  view: string;
  unread: number;
  onDashboard: () => void;
  onColleges: () => void;
  onProposals?: () => void;
  onSwitch: () => void;
}

export function Sidebar({ role, view, unread, onDashboard, onColleges, onProposals, onSwitch }: SidebarProps) {
  const r = ROLES[role];
  return (
    <aside className="sidebar">
      <div style={{ paddingLeft: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,.10)', marginBottom: '18px' }}>
        <div className="serif" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
          Promath<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.56)', marginTop: '2px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Sales CRM</div>
      </div>
      <div style={{ flex: 1 }}>
        <button className={'nav-item' + (view === 'dashboard' ? ' active' : '')} onClick={onDashboard}>
          <span>📊</span><span>Dashboard</span>
          {unread > 0 && <span className="nav-badge">{unread}</span>}
        </button>
        <button className={'nav-item' + (view === 'colleges' ? ' active' : '')} onClick={onColleges}>
          <span>🏛️</span><span>{role === 'admin' ? 'All Colleges' : 'My Assignments'}</span>
        </button>
        {onProposals && (
          <button className={'nav-item' + (view === 'proposals' ? ' active' : '')} onClick={onProposals}>
            <span>📄</span><span>Proposals</span>
          </button>
        )}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.10)', paddingTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,.06)', marginBottom: '4px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{r.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.62)' }}>Logged in</div>
          </div>
        </div>
        <button className="nav-item" onClick={onSwitch}><span>🚪</span><span>Switch role</span></button>
      </div>
    </aside>
  );
}
