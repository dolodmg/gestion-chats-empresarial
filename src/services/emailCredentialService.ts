import api from './api';
import { CreateEmailCredentialData } from '../types';

/**
 * Get all email credentials
 */
export const getCredentials = async () => {
    const response = await api.get('/email-credentials');
    return response.data;
};

/**
 * Get credential by ID
 */
export const getCredentialById = async (id: string) => {
    const response = await api.get(`/email-credentials/${id}`);
    return response.data;
};

/**
 * Create new email credential
 */
export const createCredential = async (data: CreateEmailCredentialData) => {
    const response = await api.post('/email-credentials', data);
    return response.data;
};

/**
 * Update email credential
 */
export const updateCredential = async (id: string, data: Partial<CreateEmailCredentialData>) => {
    const response = await api.put(`/email-credentials/${id}`, data);
    return response.data;
};

/**
 * Delete email credential
 */
export const deleteCredential = async (id: string) => {
    const response = await api.delete(`/email-credentials/${id}`);
    return response.data;
};

/**
 * Test SMTP connection
 */
export const testConnection = async (data: CreateEmailCredentialData) => {
    const response = await api.post('/email-credentials/test', data);
    return response.data;
};

export default {
    getCredentials,
    getCredentialById,
    createCredential,
    updateCredential,
    deleteCredential,
    testConnection,
};
