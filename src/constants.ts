export const STAGES = [
  { id: 'initial_meeting', label: 'Initial Meeting', team: 'admin', icon: '👥', group: 'Discovery' },
  { id: 'product_demo', label: 'Product Demo', team: 'admin', icon: '🖥️', group: 'Discovery' },
  { id: 'demo_followup', label: 'Demo Follow-up', team: 'admin', icon: '💬', group: 'Discovery' },
  { id: 'pricing_negotiation', label: 'Pricing & Negotiation', team: 'admin', icon: '💰', group: 'Deal' },
  { id: 'mou_signing', label: 'MOU Signing', team: 'admin', icon: '📝', group: 'Deal' },
  { id: 'syllabus_submission', label: 'Syllabus Upload', team: 'admin', icon: '📚', group: 'Content' },
  { id: 'coverage_check', label: 'Coverage Check', team: 'content', icon: '✅', group: 'Content' },
  { id: 'coverage_communication', label: 'Coverage Communicated', team: 'admin', icon: '📤', group: 'Content' },
  { id: 'student_data', label: 'Student Data Collection', team: 'admin', icon: '🎓', group: 'Implementation' },
  { id: 'license_creation', label: 'License Creation', team: 'implementation', icon: '🔑', group: 'Implementation' },
  { id: 'impl_confirmation', label: 'Implementation Date Confirmation', team: 'implementation', icon: '📅', group: 'Implementation' },
  { id: 'implementation', label: 'Implementation', team: 'implementation', icon: '⚡', group: 'Implementation' },
  { id: 'impl_feedback', label: 'Implementation Feedback', team: 'implementation', icon: '📊', group: 'Implementation' },
  { id: 'orientation', label: 'Orientation & Onboarding', team: 'engagement', icon: '🎯', group: 'Onboarding' },
];

export const ROLES = {
  admin: { label: 'Admin (Harsha)', color: '#B8410A', bg: '#FDF4ED', icon: '⚙️', desc: 'Full access. Track all colleges across all stages.' },
  content: { label: 'Content Team', color: '#3B5AA3', bg: '#EBF0FA', icon: '📚', desc: 'Review syllabi and update coverage percentages.' },
  implementation: { label: 'Implementation Team', color: '#6B46C1', bg: '#F2EDFB', icon: '⚡', desc: 'Manage licenses and confirm implementation dates.' },
  engagement: { label: 'Engagement Team', color: '#2D7A4F', bg: '#E8F3EC', icon: '🎯', desc: 'Onboard students and send credentials.' },
  billing: { label: 'Billing & Accounts', color: '#0E7490', bg: '#ECFEFF', icon: '💰', desc: 'Create quotations, invoices & proposals. Track payments.' },
};

import { UserRole } from './types';
export const ROLE_OPTIONS: UserRole[] = [
  { id: 'admin', name: 'Admin', permissions: ['Full access', 'Track all stages'] },
  { id: 'content', name: 'Content Team', permissions: ['Syllabus check', 'Update coverage'] },
  { id: 'implementation', name: 'Implementation Team', permissions: ['License creation', 'Setup track'] },
  { id: 'engagement', name: 'Engagement Team', permissions: ['Onboard students', 'Send credentials'] },
  { id: 'billing', name: 'Billing & Accounts', permissions: ['Quotations & proposals', 'Track payments'] },
];

export const CHANNEL_OPTIONS = [
  { id: 'whatsapp',  label: 'WhatsApp',     icon: '💬', color: '#25D366' },
  { id: 'sms',       label: 'SMS',          icon: '📱', color: '#3B5AA3' },
  { id: 'email',     label: 'Email',        icon: '✉️',  color: '#B8410A' },
  { id: 'audio_bot', label: 'Audio Bot',    icon: '🤖', color: '#6B46C1' },
  { id: 'push',      label: 'Push Notif',   icon: '🔔', color: '#2D7A4F' },
  { id: 'call',      label: 'Calling Task', icon: '📞', color: '#8B2500' },
];

export const CONDITION_OPTIONS = [
  { id: 'always',        label: 'Always send' },
  { id: 'not_logged_in', label: 'Only if NOT logged in' },
  { id: 'low_usage',     label: 'Only if usage < 15 mins' },
  { id: 'inactive_15',   label: 'Only if inactive 15+ days' },
  { id: 'quiz_pending',  label: 'Only if quiz not completed' },
];

export const WF_TEMPLATES = {
  onboarding: [
    { channel: 'whatsapp', delay: 0,  condition: 'always',        message: 'Welcome to Maths.Engineering! Your login is ready. Watch orientation video: [link]. Login now!' },
    { channel: 'email',    delay: 0,  condition: 'always',        message: 'Subject: Your Login Credentials\nUsername: [reg_no]\nPassword: [phone_last4]\nLogin: https://maths.engineering' },
    { channel: 'whatsapp', delay: 3,  condition: 'not_logged_in', message: 'Hi! You have not logged in yet. Just 2 mins — login here: [link]. Your maths journey is waiting!' },
    { channel: 'push',     delay: 5,  condition: 'not_logged_in', message: 'Your account is ready. Tap to login and start Unit 1 today!' },
    { channel: 'sms',      delay: 7,  condition: 'not_logged_in', message: 'Hi [name], login to Maths.Engineering: [link]. Your course is ready. -Promath Team' },
    { channel: 'call',     delay: 10, condition: 'not_logged_in', message: 'Call student. Check if they received credentials. Help them login if needed.' },
  ],
  first_usage: [
    { channel: 'whatsapp', delay: 0,  condition: 'low_usage',  message: 'Great start! Now try Unit 1 — only 15 mins. Start here: [unit1_link]. You got this!' },
    { channel: 'push',     delay: 3,  condition: 'low_usage',  message: 'Continue where you left off! Open Maths.Engineering and complete Unit 1.' },
    { channel: 'whatsapp', delay: 6,  condition: 'low_usage',  message: 'Here are Important Questions for your exam: [link]. Practice them on the platform!' },
    { channel: 'sms',      delay: 9,  condition: 'low_usage',  message: 'Hi [name], important exam questions available: [link]' },
    { channel: 'call',     delay: 12, condition: 'low_usage',  message: 'Call student. Understand why usage is low. Guide them to start Unit 1.' },
  ],
  reactivation: [
    { channel: 'whatsapp', delay: 0,  condition: 'inactive_15', message: 'Hey [name]! It has been a while. Your course is waiting: [link]' },
    { channel: 'push',     delay: 3,  condition: 'inactive_15', message: 'Come back! Your progress is saved. Continue now.' },
    { channel: 'whatsapp', delay: 6,  condition: 'inactive_15', message: 'Important Questions for your exam just updated: [link]' },
    { channel: 'sms',      delay: 11, condition: 'inactive_15', message: 'Hi [name], login and prepare for exams: [link]' },
    { channel: 'call',     delay: 16, condition: 'inactive_15', message: 'Call student. Find out why they stopped. Reactivate if possible.' },
  ],
  exam_prep: [
    { channel: 'whatsapp', delay: 0,  condition: 'always', message: 'Exam in 45 days! Crash course is live: [link]' },
    { channel: 'push',     delay: 15, condition: 'always', message: '30 days to exam! Important Problems set is now available.' },
    { channel: 'whatsapp', delay: 24, condition: 'always', message: '21 days left! Formula revision sheet: [link]. Save and revise daily.' },
    { channel: 'push',     delay: 31, condition: 'always', message: '14 days to exam! Complete your unit revision.' },
    { channel: 'whatsapp', delay: 38, condition: 'always', message: '7 days left! Most Important Questions: [link]. Attempt them all!' },
    { channel: 'push',     delay: 42, condition: 'always', message: '3 days to exam! Final preparation reminder.' },
    { channel: 'whatsapp', delay: 44, condition: 'always', message: 'All the best for your exam tomorrow! You have prepared well. Go ace it!' },
  ],
  quiz: [
    { channel: 'whatsapp', delay: 0, condition: 'always',       message: 'New Quiz available! Test your knowledge now: [quiz_link]' },
    { channel: 'push',     delay: 3, condition: 'quiz_pending', message: 'You have not attempted the new quiz yet! Try it now.' },
    { channel: 'whatsapp', delay: 6, condition: 'quiz_pending', message: 'Last reminder — Quiz closes soon! Attempt it here: [quiz_link]' },
    { channel: 'sms',      delay: 9, condition: 'quiz_pending', message: 'Hi [name], complete your quiz: [quiz_link]. Do not miss it!' },
    { channel: 'call',     delay: 12,condition: 'quiz_pending', message: 'Call student. Remind them about the quiz.' },
  ],
};
