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
  me: () => apiClient<AuthUser>('/auth/me'),
  logout: clearAuthToken,
};
