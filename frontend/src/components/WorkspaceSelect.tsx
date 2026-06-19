import type { UserRole } from '../api/authApi';
import { ROLES } from '../constants/roles';

interface WorkspaceSelectProps {
  userName: string;
  roles: UserRole[];
  onSelect: (role: UserRole) => void;
  onLogout: () => void;
}

const WORKSPACE_META: Record<UserRole, { icon: string; title: string; description: string; tone: string }> = {
  admin: {
    icon: '⚙',
    title: 'Admin',
    description: 'Full access. Track all colleges across every pipeline stage.',
    tone: 'admin',
  },
  content: {
    icon: '▥',
    title: 'Content Team',
    description: 'Review syllabi and update syllabus coverage percentages.',
    tone: 'content',
  },
  implementation: {
    icon: 'ϟ',
    title: 'Implementation Team',
    description: 'Manage licenses and confirm implementation dates.',
    tone: 'implementation',
  },
  engagement: {
    icon: '◎',
    title: 'Engagement Team',
    description: 'Onboard students and manage engagement journeys.',
    tone: 'engagement',
  },
  billing: {
    icon: '₹',
    title: 'Billing & Accounts',
    description: 'Create quotations, invoices and proposals. Track payments.',
    tone: 'billing',
  },
};

export function WorkspaceSelect({ userName, roles, onSelect, onLogout }: WorkspaceSelectProps) {
  return (
    <main className="workspace-select-page">
      <section className="workspace-select-shell">
        <div className="workspace-badge"><span /> Promath CRM · Sales OS</div>
        <h1>Run your college pipeline<span>.</span></h1>
        <p className="workspace-subtitle">
          One clear place to track meetings, demos, MOU, syllabus coverage, implementation, and onboarding.
        </p>

        <div className="workspace-grid">
          {roles.map(role => {
            const item = WORKSPACE_META[role];
            const adminName = userName.toLowerCase().includes('promath')
              ? 'Harsha'
              : userName.split(' ')[0] || 'Harsha';
            const title = role === 'admin' ? `Admin (${adminName})` : item.title;
            return (
              <button
                key={role}
                className={`workspace-card workspace-${item.tone}`}
                onClick={() => onSelect(role)}
              >
                <span className="workspace-icon">{item.icon}</span>
                <strong>{title}</strong>
                <span className="workspace-description">{item.description}</span>
                <span className="workspace-enter">Enter →</span>
              </button>
            );
          })}
        </div>

        <footer className="workspace-footer">
          <span>Built for Promath · Sales, Content, Implementation & Engagement teams</span>
          <button onClick={onLogout}>Sign out</button>
        </footer>
      </section>
    </main>
  );
}
