export interface Contact {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

export interface StageData {
  date?: string;
  attendees?: string;
  notes?: string;
  outcome?: string;
  feedback?: string;
  agreed_price?: string;
  total_students?: string;
  total_value?: string;
  mou_date?: string;
  mou_link?: string;
  subject?: string;
  semester?: string;
  units?: Array<{ name: string; topics: string }>;
  notes_for_content?: string;
  unit_coverage?: Array<{ unit: string; pct: number; notes: string }>;
  total_coverage?: number;
  communicated_at?: string;
  target_impl_date?: string;
  student_count?: number;
  file_link?: string;
  total_licenses?: number;
  licenses_created?: number;
  confirmed_date?: string;
  team_members?: string;
  actual_date?: string;
  quality?: string;
  issues?: string;
  start_date?: string;
  students_onboarded?: number;
  credentials_sent_email?: number;
  credentials_sent_whatsapp?: number;
  followup_done?: string;
  followup_comment?: string;
  followup_reason?: string;
}

export interface StageStatus {
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at: string | null;
  data: StageData;
}

export interface JourneyStep {
  id: string;
  channel: string;
  delay: number;
  condition: string;
  message: string;
  enabled: boolean;
}

export interface AutomationProgress {
  done: boolean;
  date: string;
  outcome?: string;
  note?: string;
}

export interface AutomationJourney {
  name: string;
  start_date: string;
  steps: JourneyStep[];
  data_source: 'crm' | 'csv';
  status: string;
  created_at: string;
  updated_at: string;
  csv_preview?: {
    total: number;
    headers: string[];
    rows: Array<Record<string, string>>;
  };
}

export interface UsageEntry {
  id: string;
  date: string;
  users_using: number;
  total_hours: number;
  event: string;
}

export interface UsageCourse {
  id: string;
  name: string;
  enrolled: number;
  entries: UsageEntry[];
}

export interface College {
  id: string;
  name: string;
  college_type: string;
  academic_year: string;
  contact_name: string;
  contact_designation: string;
  phone: string;
  email: string;
  location: string;
  total_students: string;
  current_status: string;
  additional_comments: string;
  created_at: string;
  stages: Record<string, StageStatus>;
  engagement_journey?: {
    current_stage?: string;
    steps: Record<string, Record<string, any>>; // Record<stageId, Record<stepId, any>>
  };
  automation_journey_progress?: Record<string, AutomationProgress>;
  automation_journey?: AutomationJourney;
  usage_courses?: UsageCourse[];
}

export interface Notification {
  id: string;
  role: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserRole {
  id: 'admin' | 'content' | 'implementation' | 'engagement' | 'billing';
  name: string;
  permissions: string[];
}

export interface BillingDocItem {
  description: string;
  qty: string;
  rate: string;
  amount: string;
}

export interface BillingDoc {
  id: string;
  type: 'quotations' | 'invoices' | 'proposals';
  college: string;
  contact_person: string;
  date: string;
  valid_until?: string;
  reference: string;
  items: BillingDocItem[];
  subtotal: number;
  gst: number;
  total: number;
  notes?: string;
  payment_terms?: string;
  status: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  college: string;
  address: string;
  quote_no: string;
  quote_date: string;
  type: 'with_app' | 'without_app';
  m1_price: string;
  m2_price: string;
  m3_price: string;
  m1_year: string;
  m2_year: string;
  m3_year: string;
  include_m3: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}
