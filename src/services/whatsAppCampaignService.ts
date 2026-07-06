import api from './api';
import { CreateWhatsAppCampaignData, WhatsAppCampaignRecipient } from '../types';

export const getWhatsAppCampaigns = async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/whatsapp-campaigns', { params });
    return response.data;
};

export const getWhatsAppCampaignById = async (id: string) => {
    const response = await api.get(`/whatsapp-campaigns/${id}`);
    return response.data;
};

export const createWhatsAppCampaign = async (data: CreateWhatsAppCampaignData) => {
    const response = await api.post('/whatsapp-campaigns', data);
    return response.data;
};

export const updateWhatsAppCampaign = async (id: string, data: Partial<CreateWhatsAppCampaignData>) => {
    const response = await api.put(`/whatsapp-campaigns/${id}`, data);
    return response.data;
};

export const deleteWhatsAppCampaign = async (id: string) => {
    const response = await api.delete(`/whatsapp-campaigns/${id}`);
    return response.data;
};

export const addWhatsAppRecipients = async (
    id: string,
    recipients: Array<Pick<WhatsAppCampaignRecipient, 'phoneNumber' | 'name'>>
) => {
    const response = await api.post(`/whatsapp-campaigns/${id}/recipients`, { recipients });
    return response.data;
};

export const parseWhatsAppCSV = async (csvContent: string) => {
    const response = await api.post('/whatsapp-campaigns/parse-csv', { csvContent });
    return response.data;
};

export const sendWhatsAppCampaign = async (id: string) => {
    const response = await api.post(`/whatsapp-campaigns/${id}/send`);
    return response.data;
};

export const getWhatsAppCampaignStats = async () => {
    const response = await api.get('/whatsapp-campaigns/stats');
    return response.data;
};

export default {
    getWhatsAppCampaigns,
    getWhatsAppCampaignById,
    createWhatsAppCampaign,
    updateWhatsAppCampaign,
    deleteWhatsAppCampaign,
    addWhatsAppRecipients,
    parseWhatsAppCSV,
    sendWhatsAppCampaign,
    getWhatsAppCampaignStats
};
