import type { Notification } from '../types/college.types';
import { apiClient } from './client';

export interface NotificationRecord {
  _id: string;
  title: string;
  message: string;
  type: string;
  targetRole: string;
  targetUser: string;
  isRead: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationRecordToUi = (record: NotificationRecord): Notification => ({
  id: record._id,
  role: record.targetRole,
  message: record.message,
  timestamp: record.createdAt,
  read: record.isRead,
});

export const notificationApi = {
  list: () => apiClient<NotificationRecord[]>('/notifications'),
  create: (input: {
    title: string;
    message: string;
    type?: string;
    targetRole?: string;
    targetUser?: string;
  }) => apiClient<NotificationRecord>('/notifications', { method: 'POST', body: JSON.stringify(input) }),
  markRead: (id: string) =>
    apiClient<NotificationRecord>(`/notifications/${id}/read`, { method: 'PATCH' }),
  delete: (id: string) =>
    apiClient<{ deleted: boolean; id: string }>(`/notifications/${id}`, { method: 'DELETE' }),
};
