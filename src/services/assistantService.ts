import api from "./api";

export interface AssistantPromptRecord {
  _id: string;
  version: number;
  promptText: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
  isActive?: boolean;
}

export interface GetPromptResponse {
  success: boolean;
  prompt?: string;
  version?: number;
  workflowId?: string;
  nodeId?: string;
  lastUpdated?: string;
}

export interface UpdatePromptPayload {
  prompt: string;
  description?: string;
  workflowId?: string;
  nodeId?: string;
}

export interface UpdatePromptResponse {
  success: boolean;
  message: string;
  version: number;
  updatedAt: string;
}

export interface GetPromptHistoryResponse {
  success: boolean;
  prompts: AssistantPromptRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DailyTrend {
  _id: string;
  total: number;
  userCount: number;
}

export interface TopCategory {
  category: string;
  count: number;
}

export interface AnalyticsStats {
  received: number;
  sent: number;
  total: number;
  dailyTrend: DailyTrend[];
  peakHours: string[];
  topCategories: TopCategory[];
  satisfactionRate: number | null;
}

export interface GetAnalyticsResponse {
  success: boolean;
  stats: AnalyticsStats;
}

export interface ImprovementSuggestion {
  _id: string;
  type: 'knowledge_gap' | 'escalation' | 'sentiment';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface GetImprovementsResponse {
  success: boolean;
  suggestions: ImprovementSuggestion[];
}

export interface GenerateImprovementsResponse {
  success: boolean;
  count: number;
  suggestions: ImprovementSuggestion[];
}

export const assistantService = {
  getPrompt: async (clientId?: string) => {
    const response = await api.get<GetPromptResponse>(`/assistant/prompt`, {
      params: clientId ? { clientId } : undefined,
    });
    return response.data;
  },

  updatePrompt: async (data: UpdatePromptPayload, clientId?: string) => {
    const response = await api.put<UpdatePromptResponse>(`/assistant/prompt`, data, {
      params: clientId ? { clientId } : undefined,
    });
    return response.data;
  },

  getHistory: async (page = 1, limit = 10, clientId?: string) => {
    const params: Record<string, any> = { page, limit };
    if (clientId) params.clientId = clientId;
    const response = await api.get<GetPromptHistoryResponse>(`/assistant/prompt/history`, { params });
    return response.data;
  },

  restorePrompt: async (id: string, clientId?: string) => {
    const response = await api.post<{ success: boolean }>(
      `/assistant/prompt/restore/${id}`,
      {},
      { params: clientId ? { clientId } : undefined }
    );
    return response.data;
  },

  getAnalytics: async (clientId?: string) => {
    const response = await api.get<GetAnalyticsResponse>(`/assistant/analytics`, {
      params: clientId ? { clientId } : undefined,
    });
    return response.data;
  },

  getImprovements: async (clientId?: string) => {
    const response = await api.get<GetImprovementsResponse>(`/assistant/improvements`, {
      params: clientId ? { clientId } : undefined,
    });
    return response.data;
  },

  generateImprovements: async (clientId?: string) => {
    const response = await api.post<GenerateImprovementsResponse>(
      `/assistant/improvements/generate`,
      {},
      { params: clientId ? { clientId } : undefined }
    );
    return response.data;
  },
};
