import api, { clearStoredBrowserToken, getStoredBrowserToken, refreshBrowserToken } from './api';
import { ClientFeatureFlags } from '@/utils/featureFlags';

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
  hasWhatsappToken?: boolean;
  featureFlags?: Partial<ClientFeatureFlags>;
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
    await refreshBrowserToken();

    return { token, user };
  },

  async getCurrentUser(): Promise<User> {
    // Docs: GET /api/auth
    const response = await api.get('/auth');
    await refreshBrowserToken();
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

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    clearStoredBrowserToken();
  },

  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  async refreshBrowserToken(): Promise<string> {
    return refreshBrowserToken();
  },

  getStoredBrowserToken(): string | null {
    return getStoredBrowserToken();
  }
};
