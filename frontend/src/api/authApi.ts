import { clearAuthToken, setAuthToken } from '../services/authToken';
import { apiClient } from './client';

export type UserRole = 'admin' | 'content' | 'implementation' | 'engagement' | 'billing';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  async login(email: string, password: string) {
    const response = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(response.accessToken);
    return response;
  },
  forgotPassword: (email: string) =>
    apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  me: () => apiClient<AuthUser>('/auth/me'),
  logout: clearAuthToken,
};
