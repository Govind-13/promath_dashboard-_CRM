import type { ProposalDoc } from '../types/billing.types';
import { apiClient } from './client';

export interface BillingProposalRecord {
  _id: string;
  collegeId: string;
  proposalNumber: string;
  proposalTitle: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: string;
  generatedBy: string;
  generatedAt: string;
  validUntil?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ProposalMetadata {
  college_name?: string;
  contact_name?: string;
  location?: string;
  students?: number;
  price_per_student?: number;
  academic_year?: string;
  features?: string[];
  notes?: string;
}

const parseMetadata = (notes: string): ProposalMetadata => {
  try {
    return JSON.parse(notes);
  } catch {
    return { notes };
  }
};

export const billingRecordToUi = (record: BillingProposalRecord): ProposalDoc => {
  const meta = parseMetadata(record.notes || '');
  return {
    id: record._id,
    college_id: record.collegeId || '',
    college_name: meta.college_name || record.proposalTitle,
    contact_name: meta.contact_name || '',
    location: meta.location || '',
    students: Number(meta.students || 0),
    price_per_student: Number(meta.price_per_student || 0),
    total_value: Number(record.finalAmount ?? record.amount ?? 0),
    academic_year: meta.academic_year || '',
    features: meta.features || [],
    notes: meta.notes || '',
    created_at: record.generatedAt || record.createdAt,
    proposal_number: record.proposalNumber,
    status: record.status,
  };
};

export const billingUiToInput = (proposal: ProposalDoc) => ({
  collegeId: proposal.college_id,
  proposalNumber: proposal.proposal_number || `PROP-${Date.now()}`,
  proposalTitle: proposal.college_name || 'Proposal',
  amount: proposal.total_value,
  discount: 0,
  finalAmount: proposal.total_value,
  status: proposal.status || 'draft',
  generatedAt: proposal.created_at,
  notes: JSON.stringify({
    college_name: proposal.college_name,
    contact_name: proposal.contact_name,
    location: proposal.location,
    students: proposal.students,
    price_per_student: proposal.price_per_student,
    academic_year: proposal.academic_year,
    features: proposal.features,
    notes: proposal.notes,
  }),
});

export const billingApi = {
  list: () => apiClient<BillingProposalRecord[]>('/billing/proposals'),
  get: (id: string) => apiClient<BillingProposalRecord>(`/billing/proposals/${id}`),
  create: (input: ReturnType<typeof billingUiToInput>) =>
    apiClient<BillingProposalRecord>('/billing/proposals', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: ReturnType<typeof billingUiToInput>) =>
    apiClient<BillingProposalRecord>(`/billing/proposals/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  delete: (id: string) =>
    apiClient<{ deleted: boolean; id: string }>(`/billing/proposals/${id}`, { method: 'DELETE' }),
};
