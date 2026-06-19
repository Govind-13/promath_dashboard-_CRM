import type { StageData, StageStatus } from '../types/college.types';
import { apiClient } from './client';

export interface StageUpdateRecord {
  _id: string;
  collegeId: string;
  stageName: string;
  stageIndex: number;
  status: StageStatus;
  remarks: string;
  completedBy: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageUpdateInput {
  stageName?: string;
  stageIndex?: number;
  status?: StageStatus;
  remarks?: string;
  completedAt?: string;
}

export const stageRecordToUi = (record: StageUpdateRecord): StageData => {
  let data: Record<string, unknown> = {};
  if (record.remarks) {
    try {
      data = JSON.parse(record.remarks);
    } catch {
      data = { notes: record.remarks };
    }
  }
  return {
    id: record._id,
    status: record.status,
    completed_at: record.completedAt || null,
    data,
  };
};

export const stageApi = {
  list: (collegeId: string) => apiClient<StageUpdateRecord[]>(`/colleges/${collegeId}/stages`),
  create: (collegeId: string, input: StageUpdateInput) =>
    apiClient<StageUpdateRecord>(`/colleges/${collegeId}/stages`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (collegeId: string, stageUpdateId: string, input: StageUpdateInput) =>
    apiClient<StageUpdateRecord>(`/colleges/${collegeId}/stages/${stageUpdateId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
