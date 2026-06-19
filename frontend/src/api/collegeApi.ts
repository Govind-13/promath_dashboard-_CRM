import type { College } from '../types/college.types';
import { STAGES } from '../constants/stages';
import { apiClient } from './client';

export interface CollegeRecord {
  _id: string;
  name: string;
  location: string;
  district: string;
  state: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  website: string;
  collegeType: string;
  assignedTo: string;
  currentStage: string;
  status: string;
  priority: string;
  source: string;
  notes: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CollegeInput {
  name?: string;
  location?: string;
  district?: string;
  state?: string;
  contactPerson?: string;
  designation?: string;
  phone?: string;
  email?: string;
  website?: string;
  collegeType?: string;
  assignedTo?: string;
  currentStage?: string;
  status?: string;
  priority?: string;
  source?: string;
  notes?: string;
  version?: number;
}

const emptyStages = () =>
  Object.fromEntries(
    STAGES.map(stage => [stage.id, { status: 'not_started' as const, completed_at: null, data: {} }]),
  );

export const collegeRecordToUi = (record: CollegeRecord): College => ({
  id: record._id,
  name: record.name,
  college_type: record.collegeType || '',
  academic_year: '',
  contact_name: record.contactPerson || '',
  contact_designation: record.designation || '',
  phone: record.phone || '',
  email: record.email || '',
  location: record.location || '',
  total_students: '',
  current_status: record.status || '',
  additional_comments: record.notes || '',
  created_at: record.createdAt,
  stages: emptyStages(),
  version: record.version,
});

export const collegeUiToInput = (college: Partial<College>): CollegeInput => ({
  name: college.name,
  location: college.location,
  contactPerson: college.contact_name,
  designation: college.contact_designation,
  phone: college.phone,
  email: college.email,
  collegeType: college.college_type,
  status: college.current_status || 'active',
  notes: college.additional_comments || '',
  version: college.version,
});

export const collegeApi = {
  list: () => apiClient<CollegeRecord[]>('/colleges'),
  get: (id: string) => apiClient<CollegeRecord>(`/colleges/${id}`),
  create: (input: CollegeInput) =>
    apiClient<CollegeRecord>('/colleges', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: CollegeInput) =>
    apiClient<CollegeRecord>(`/colleges/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  delete: (id: string) => apiClient<{ deleted: boolean; id: string }>(`/colleges/${id}`, { method: 'DELETE' }),
};
