export const ROLES: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  admin: { label: 'Admin (Harsha)', color: '#175CD3', bg: '#EEF4FF', icon: '👑', desc: 'Full access to all colleges and pipeline stages' },
  content: { label: 'Content Team', color: '#6B46C1', bg: '#F2EDFB', icon: '📚', desc: 'Syllabus review and coverage check' },
  implementation: { label: 'Implementation Team', color: '#B8410A', bg: '#FDF4ED', icon: '⚡', desc: 'Student data, licenses, and implementation' },
  engagement: { label: 'Engagement Team', color: '#2D7A4F', bg: '#E8F3EC', icon: '🔥', desc: 'Student engagement and retention' },
  billing: { label: 'Billing Team', color: '#0E7490', bg: '#ECFDF5', icon: '💳', desc: 'Quotations, invoices, and proposals' },
};
