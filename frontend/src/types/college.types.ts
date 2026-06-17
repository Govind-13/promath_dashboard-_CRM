export type StageStatus = 'not_started' | 'in_progress' | 'completed';

export interface StageData {
  status: StageStatus;
  completed_at: string | null;
  data: Record<string, unknown>;
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
  current_status?: string;
  additional_comments?: string;
  created_at: string;
  stages: Record<string, StageData>;
  engagement_journey?: Record<string, boolean>;
  automation_journey?: JourneyStep[];
  automation_journey_progress?: Record<string, unknown>;
}

export interface JourneyStep {
  id: string;
  channel: string;
  delay: number;
  condition: string;
  message: string;
  enabled?: boolean;
}

export interface Notification {
  id: string;
  role: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppData {
  colleges: College[];
  notifications: Notification[];
}
