import api from './api';

export interface ChatSummary {
    _id: string;
    chatId: string;
    clientId: string;
    summary: string;
    messageCount: number;
    generatedAt: string;
    lastMessageDate: string;
    generatedBy: {
        _id: string;
        name: string;
        email: string;
    };
}

export interface GenerateSummaryResponse {
    success: boolean;
    summary: {
        id: string;
        summary: string;
        messageCount: number;
        generatedAt: string;
        lastMessageDate: string;
    };
    error?: string;
    hoursSinceOpened?: number;
}

export interface GetSummariesResponse {
    success: boolean;
    summaries: ChatSummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetLatestSummaryResponse {
    success: boolean;
    summary: ChatSummary;
    error?: string;
}

const summaryService = {
    /**
     * Genera un nuevo resumen para un chat
     */
    generateSummary: async (chatId: string): Promise<GenerateSummaryResponse> => {
        const response = await api.post<GenerateSummaryResponse>(
            `/summaries/generate/${chatId}`
        );
        return response.data;
    },

    /**
     * Obtiene todos los resúmenes de un chat
     */
    getChatSummaries: async (chatId: string, page = 1, limit = 10): Promise<GetSummariesResponse> => {
        const response = await api.get<GetSummariesResponse>(
            `/summaries/${chatId}`,
            {
                params: { page, limit }
            }
        );
        return response.data;
    },

    /**
     * Obtiene el resumen más reciente de un chat
     */
    getLatestSummary: async (chatId: string): Promise<GetLatestSummaryResponse> => {
        const response = await api.get<GetLatestSummaryResponse>(
            `/summaries/${chatId}/latest`
        );
        return response.data;
    }
};

export default summaryService;
