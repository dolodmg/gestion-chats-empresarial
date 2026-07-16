import api from './api';
import { ClientFeatureFlags } from '@/utils/featureFlags';
import { ManualControlPreferences } from '@/utils/manualControl';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'advisor';
  clientId?: string;
  advisorId?: string;
  workflowId?: string;
  whatsappToken?: string;
  featureFlags?: Partial<ClientFeatureFlags>;
  allowPasswordChange?: boolean;
  manualControlPreferences?: Partial<ManualControlPreferences>;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;

    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));

    return { token, user };
  },

  async getCurrentUser(): Promise<User> {
    // Docs: GET /api/auth
    const response = await api.get('/auth');
    const data = response.data;
    return {
      ...data,
      id: data.id ?? data._id
    } as User;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ msg: string }> {
    // Docs: POST /api/auth/change-password
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return res.data;
  },

  async updateManualControlPreferences(
    preferences: Pick<ManualControlPreferences, 'durationSelectionEnabled' | 'workdayEndTime'>
  ): Promise<ManualControlPreferences> {
    const response = await api.put('/auth/manual-control-preferences', preferences);
    return response.data.manualControlPreferences;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};
