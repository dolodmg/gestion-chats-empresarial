import api from './api';
import { CreateCampaignData, Recipient } from '../types';

/**
 * Get all campaigns
 */
export const getCampaigns = async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/campaigns', { params });
    return response.data;
};

/**
 * Get campaign by ID
 */
export const getCampaignById = async (id: string) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
};

/**
 * Create new campaign
 */
export const createCampaign = async (data: CreateCampaignData) => {
    const response = await api.post('/campaigns', data);
    return response.data;
};

/**
 * Update campaign
 */
export const updateCampaign = async (id: string, data: Partial<CreateCampaignData>) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
};

/**
 * Delete campaign
 */
export const deleteCampaign = async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
};

/**
 * Add recipients to campaign
 */
export const addRecipients = async (id: string, recipients: Recipient[]) => {
    const response = await api.post(`/campaigns/${id}/recipients`, { recipients });
    return response.data;
};

/**
 * Parse CSV content
 */
export const parseCSV = async (csvContent: string) => {
    const response = await api.post('/campaigns/parse-csv', { csvContent });
    return response.data;
};

/**
 * Send campaign
 */
export const sendCampaign = async (id: string) => {
    const response = await api.post(`/campaigns/${id}/send`);
    return response.data;
};

/**
 * Get campaign statistics
 */
export const getStats = async () => {
    const response = await api.get('/campaigns/stats');
    return response.data;
};

export default {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addRecipients,
    parseCSV,
    sendCampaign,
    getStats,
};
