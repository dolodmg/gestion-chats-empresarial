import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://chat.pupuia.com'}/api/meta`;

// Get authentication token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    console.log('🔑 Meta Service - Token:', token ? 'EXISTS' : 'NULL');
    return token;
};

// Get Meta configuration
export const getMetaConfig = async () => {
    const response = await axios.get(`${API_URL}/config`, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};

// Save Meta configuration
export const saveMetaConfig = async (config: {
    metaDatasetId: string;
    metaAccessToken: string;
    metaTestEventCode?: string;
}) => {
    const response = await axios.post(`${API_URL}/config`, config, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};

// Delete Meta configuration
export const deleteMetaConfig = async () => {
    const response = await axios.delete(`${API_URL}/config`, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};

// Test Meta API connection
export const testConnection = async (config: {
    metaDatasetId: string;
    metaAccessToken: string;
    metaTestEventCode?: string;
}) => {
    const response = await axios.post(`${API_URL}/config/test`, config, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};

// Send manual event
export const sendManualEvent = async (eventData: {
    chatId: string;
    eventName: string;
    value?: number;
    currency?: string;
}) => {
    const response = await axios.post(`${API_URL}/events/send`, eventData, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};

// Get tag mappings
export const getTagMappings = async () => {
    const response = await axios.get(`${API_URL}/mappings`, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};

// Create tag mapping
export const createTagMapping = async (mapping: {
    tagName: string;
    eventName: string;
    defaultValue?: number;
    defaultCurrency?: string;
}) => {
    const response = await axios.post(`${API_URL}/mappings`, mapping, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};

// Delete tag mapping
export const deleteTagMapping = async (tagName: string) => {
    const response = await axios.delete(`${API_URL}/mappings/${tagName}`, {
        headers: {
            'x-auth-token': getAuthToken()
        }
    });
    return response.data;
};
