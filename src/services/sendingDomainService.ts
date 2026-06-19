import api from './api';
import { CreateSendingDomainData } from '../types';

export const getSendingDomains = async () => {
    const response = await api.get('/sending-domains');
    return response.data;
};

export const getSendingDomainById = async (id: string) => {
    const response = await api.get(`/sending-domains/${id}`);
    return response.data;
};

export const createSendingDomain = async (data: CreateSendingDomainData) => {
    const response = await api.post('/sending-domains', data);
    return response.data;
};

export const verifySendingDomain = async (id: string) => {
    const response = await api.post(`/sending-domains/${id}/verify`);
    return response.data;
};

export const deleteSendingDomain = async (id: string) => {
    const response = await api.delete(`/sending-domains/${id}`);
    return response.data;
};

export default {
    getSendingDomains,
    getSendingDomainById,
    createSendingDomain,
    verifySendingDomain,
    deleteSendingDomain
};
