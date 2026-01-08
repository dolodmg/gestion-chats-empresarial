import api from './api';

export interface AdvisorMetrics {
    advisorId: string;
    advisorName: string;
    advisorEmail: string;
    totalChats: number;
    taggedChats: number;
    tagBreakdown: Record<string, number>;
}

class AdvisorMetricsService {
    async getMetrics(clientId?: string): Promise<AdvisorMetrics[]> {
        const params = clientId ? { clientId } : {};
        const response = await api.get('/advisor-metrics', { params });
        return response.data;
    }
}

export const advisorMetricsService = new AdvisorMetricsService();
