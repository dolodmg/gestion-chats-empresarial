import api from './api';
import { User } from './authService';
import { ClientFeatureFlags } from '@/utils/featureFlags';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'client';
  clientId?: string;
  workflowId?: string;
  whatsappToken?: string;
  wabaId?: string;
  featureFlags?: Partial<ClientFeatureFlags>;
  allowPasswordChange?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'client';
  clientId?: string;
  workflowId?: string;
  whatsappToken?: string;
  wabaId?: string;
  featureFlags?: Partial<ClientFeatureFlags>;
  allowPasswordChange?: boolean;
}

export interface ClientAdminMetrics {
  clientId: string;
  incomingMessages: number;
  botMessages: number;
  totalMessages: number;
  activeChatsInRange: number;
  lastMessageAt: string | null;
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface ClientMetricsFilters {
  clientId: string;
  startDate?: string;
  endDate?: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async getClientMetrics(filters: ClientMetricsFilters): Promise<ClientAdminMetrics> {
    const response = await api.get('/users/metrics/clients', {
      params: filters
    });
    return response.data;
  },

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
};
