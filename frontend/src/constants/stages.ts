export interface Stage {
  id: string;
  label: string;
  team: string;
  icon: string;
  group: string;
}

export const STAGES: Stage[] = [
  { id: 'initial_meeting', label: 'Initial Meeting', team: 'admin', icon: '👥', group: 'Discovery' },
  { id: 'product_demo', label: 'Product Demo', team: 'admin', icon: '🎯', group: 'Discovery' },
  { id: 'demo_followup', label: 'Demo Follow-up', team: 'admin', icon: '📞', group: 'Discovery' },
  { id: 'pricing_negotiation', label: 'Pricing Negotiation', team: 'admin', icon: '💰', group: 'Deal' },
  { id: 'mou_signing', label: 'MOU Signing', team: 'admin', icon: '📝', group: 'Deal' },
  { id: 'syllabus_submission', label: 'Syllabus Submission', team: 'admin', icon: '📚', group: 'Content' },
  { id: 'coverage_check', label: 'Coverage Check', team: 'content', icon: '✅', group: 'Content' },
  { id: 'coverage_communication', label: 'Coverage Communication', team: 'admin', icon: '📣', group: 'Content' },
  { id: 'student_data', label: 'Student Data Collection', team: 'implementation', icon: '📊', group: 'Implementation' },
  { id: 'license_creation', label: 'License Creation', team: 'implementation', icon: '🔑', group: 'Implementation' },
  { id: 'impl_confirmation', label: 'Implementation Confirmation', team: 'implementation', icon: '📅', group: 'Implementation' },
  { id: 'implementation', label: 'Implementation', team: 'implementation', icon: '⚡', group: 'Implementation' },
  { id: 'impl_feedback', label: 'Implementation Feedback', team: 'engagement', icon: '💬', group: 'Implementation' },
  { id: 'orientation', label: 'Orientation', team: 'engagement', icon: '🎓', group: 'Onboarding' },
];
