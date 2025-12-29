import api from './api';

// Types
export interface Advisor {
    _id: string;
    clientId: string;
    name: string;
    email?: string;
    phone?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdvisorConfig {
    _id: string;
    clientId: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdvisorTableAssignment {
    _id: string;
    clientId: string;
    advisorId: Advisor;
    tableId: string;
    position: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdvisorStats {
    totalAdvisors: number;
    activeAdvisors: number;
    totalAssignments: number;
    moduleEnabled: boolean;
}

// Configuración
export const getConfig = async (): Promise<AdvisorConfig> => {
    const response = await api.get('/advisors/config');
    return response.data.data;
};

export const updateConfig = async (enabled: boolean): Promise<AdvisorConfig> => {
    const response = await api.put('/advisors/config', { enabled });
    return response.data.data;
};

// CRUD Asesores
export const getAdvisors = async (): Promise<Advisor[]> => {
    const response = await api.get('/advisors');
    return response.data.data;
};

export const createAdvisor = async (data: {
    name: string;
    email?: string;
    phone?: string;
}): Promise<Advisor> => {
    const response = await api.post('/advisors', data);
    return response.data.data;
};

export const updateAdvisor = async (
    id: string,
    data: {
        name?: string;
        email?: string;
        phone?: string;
        active?: boolean;
    }
): Promise<Advisor> => {
    const response = await api.put(`/advisors/${id}`, data);
    return response.data.data;
};

export const deleteAdvisor = async (id: string): Promise<void> => {
    await api.delete(`/advisors/${id}`);
};

// Asignaciones a Tablas
export const getTableAssignments = async (
    tableId: string
): Promise<AdvisorTableAssignment[]> => {
    const response = await api.get(`/advisors/assignments/${tableId}`);
    return response.data.data;
};

export const assignToTable = async (
    advisorId: string,
    tableId: string
): Promise<AdvisorTableAssignment> => {
    const response = await api.post('/advisors/assignments', {
        advisorId,
        tableId,
    });
    return response.data.data;
};

export const removeFromTable = async (assignmentId: string): Promise<void> => {
    await api.delete(`/advisors/assignments/${assignmentId}`);
};

// Estadísticas
export const getStats = async (): Promise<AdvisorStats> => {
    const response = await api.get('/advisors/stats');
    return response.data.data;
};

export const advisorService = {
    getConfig,
    updateConfig,
    getAdvisors,
    createAdvisor,
    updateAdvisor,
    deleteAdvisor,
    getTableAssignments,
    assignToTable,
    removeFromTable,
    getStats,
};

export default advisorService;
