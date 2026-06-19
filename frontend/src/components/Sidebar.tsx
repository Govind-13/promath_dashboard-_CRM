export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  userName: string;
  roleLabel: string;
  roleIcon: string;
  items: SidebarItem[];
  activeView: string;
  unread: number;
  onNavigate: (id: string) => void;
  onSwitchWorkspace?: () => void;
  onLogout: () => void;
}

export function Sidebar({
  userName,
  roleLabel,
  roleIcon,
  items,
  activeView,
  unread,
  onNavigate,
  onSwitchWorkspace,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Promath<span>.</span></h2>
        <p>Sales CRM</p>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {items.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'nav-item-active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'dashboard' && unread > 0 && <span className="nav-count">{unread}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-account">
        <div className="account-card">
          <span className="account-avatar">{roleIcon}</span>
          <span>
            <strong>{userName}</strong>
            <small>{roleLabel}</small>
          </span>
        </div>
        {onSwitchWorkspace && (
          <button className="sidebar-logout" onClick={onSwitchWorkspace}>
            <span>⇄</span> Switch workspace
          </button>
        )}
        <button className="sidebar-logout" onClick={onLogout}>
          <span>↪</span> Logout
        </button>
      </div>
    </aside>
  );
}
