import api from './api';
import { User } from './authService';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'client';
  clientId?: string;
  workflowId?: string;
  whatsappToken?: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string; 
    role?: 'admin' | 'client';
    clientId?: string;
    workflowId?: string;
    whatsappToken?: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  }
};