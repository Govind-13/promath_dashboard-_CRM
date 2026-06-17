export const ENG_STAGES = [
  { id: 'onboarding', label: 'Onboarding', icon: '📦', color: '#3B5AA3', bg: '#EBF0FA' },
  { id: 'first_usage', label: 'First Usage', icon: '🚀', color: '#B8410A', bg: '#FDF4ED' },
  { id: 'active', label: 'Active Nurture', icon: '🔥', color: '#2D7A4F', bg: '#E8F3EC' },
  { id: 'exam_prep', label: 'Exam Prep', icon: '📝', color: '#6B46C1', bg: '#F2EDFB' },
  { id: 'reactivation', label: 'Reactivation', icon: '⚡', color: '#8B2500', bg: '#FFF0EB' },
];

export const CHANNEL_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
  { id: 'email', label: 'Email', icon: '📧', color: '#3B5AA3' },
  { id: 'push', label: 'Push', icon: '🔔', color: '#6B46C1' },
  { id: 'sms', label: 'SMS', icon: '📱', color: '#0E7490' },
  { id: 'call', label: 'Call', icon: '📞', color: '#B8410A' },
];

export const CONDITION_OPTIONS = [
  { id: 'always', label: 'Always' },
  { id: 'not_logged_in', label: 'Not logged in' },
  { id: 'low_usage', label: 'Low usage (<15 min)' },
  { id: 'inactive_15', label: 'Inactive 15+ days' },
  { id: 'quiz_pending', label: 'Quiz not attempted' },
];

export const WF_STEPS: Record<string, { id: string; label: string }[]> = {
  onboarding: [
    { id: 'welcome_wa', label: 'WhatsApp welcome + orientation video sent' },
    { id: 'creds_email', label: 'Credentials email sent' },
    { id: 'first_login', label: 'First login received from students' },
    { id: 'login_reminder', label: 'Day 3 — WhatsApp login reminder sent' },
    { id: 'push_reminder', label: 'Day 5 — Push notification sent' },
    { id: 'sms_reminder', label: 'Day 7 — SMS reminder sent' },
    { id: 'calling_task', label: 'Day 10 — Calling task created' },
  ],
  first_usage: [
    { id: 'unit1_nudge', label: 'Unit 1 nudge WhatsApp sent' },
    { id: 'usage_15', label: 'Usage crossed 15 mins threshold' },
    { id: 'push_engage', label: 'Push notification — continue learning sent' },
    { id: 'imp_questions', label: 'Important Questions WhatsApp sent' },
    { id: 'usage_60', label: 'Usage crossed 60 mins — moved to Active' },
  ],
  active: [
    { id: 'weekly_report', label: 'Weekly usage report sent to faculty' },
    { id: 'quiz_nudge', label: 'Quiz attempt nudge sent' },
    { id: 'leaderboard', label: 'Leaderboard update shared' },
    { id: 'faculty_call', label: 'Monthly faculty check-in call done' },
  ],
  exam_prep: [
    { id: 'mock_test_link', label: 'Mock test link shared' },
    { id: 'imp_topics', label: 'Important topics revision nudge' },
    { id: 'last_min_tips', label: 'Last-minute tips WhatsApp sent' },
  ],
  reactivation: [
    { id: 'inactive_wa', label: 'Reactivation WhatsApp sent' },
    { id: 'inactive_email', label: 'Reactivation email sent' },
    { id: 'inactive_call', label: 'Calling task for inactive students created' },
    { id: 'faculty_alert', label: 'Faculty alerted about inactive batch' },
  ],
};

export const WF_TEMPLATES: Record<string, { channel: string; delay: number; condition: string; message: string }[]> = {
  onboarding: [
    { channel: 'whatsapp', delay: 0, condition: 'always', message: 'Welcome to Promath! 🎉 Your login credentials have been sent to your email. Start exploring now!' },
    { channel: 'email', delay: 0, condition: 'always', message: 'Your Promath account is ready. Login at app.promath.in with your credentials.' },
    { channel: 'whatsapp', delay: 3, condition: 'not_logged_in', message: 'Hi! Haven\'t logged in yet? Your Promath account is waiting. Need help? Reply here!' },
    { channel: 'push', delay: 5, condition: 'not_logged_in', message: 'Your classmates are already practicing! Login to Promath now.' },
    { channel: 'sms', delay: 7, condition: 'not_logged_in', message: 'Promath reminder: Login to start your math practice. Visit app.promath.in' },
  ],
  first_usage: [
    { channel: 'whatsapp', delay: 1, condition: 'always', message: 'Great start! 🚀 Try Unit 1 questions today — just 15 minutes!' },
    { channel: 'push', delay: 3, condition: 'low_usage', message: 'Continue where you left off! Your progress is saved.' },
    { channel: 'whatsapp', delay: 5, condition: 'always', message: '📌 Important Questions for your upcoming exam are now available!' },
  ],
  reactivation: [
    { channel: 'whatsapp', delay: 0, condition: 'inactive_15', message: 'We miss you! 💪 Come back and complete your pending topics.' },
    { channel: 'email', delay: 2, condition: 'inactive_15', message: 'Your Promath progress is waiting. Pick up where you left off.' },
    { channel: 'call', delay: 5, condition: 'inactive_15', message: 'Call student to check if they need help getting back on track.' },
  ],
  exam_prep: [
    { channel: 'whatsapp', delay: 0, condition: 'always', message: '📝 Exam season! Mock tests are live on Promath. Attempt now!' },
    { channel: 'push', delay: 1, condition: 'quiz_pending', message: 'Your mock test is pending! Take it today for best results.' },
    { channel: 'whatsapp', delay: 3, condition: 'always', message: 'Last-minute revision tips: Focus on these key topics 👆' },
  ],
  quiz: [
    { channel: 'whatsapp', delay: 0, condition: 'always', message: '🎯 New quiz available! Test yourself on this week\'s topics.' },
    { channel: 'push', delay: 1, condition: 'quiz_pending', message: 'Quiz reminder: Complete your pending quiz before the deadline!' },
  ],
};
