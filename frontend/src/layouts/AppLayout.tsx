import type { ReactNode } from 'react';
import { Sidebar, type SidebarItem } from '../components/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  userName: string;
  roleLabel: string;
  roleIcon: string;
  items: SidebarItem[];
  activeView: string;
  unread: number;
  onNavigate: (id: string) => void;
  onLogout: () => void;
}

export function AppLayout({
  children,
  userName,
  roleLabel,
  roleIcon,
  items,
  activeView,
  unread,
  onNavigate,
  onLogout,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar
        userName={userName}
        roleLabel={roleLabel}
        roleIcon={roleIcon}
        items={items}
        activeView={activeView}
        unread={unread}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <main className="main-content">
        <div className="content-container">{children}</div>
      </main>
    </div>
  );
}
