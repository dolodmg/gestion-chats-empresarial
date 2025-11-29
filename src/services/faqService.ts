import api from "./api";

export interface FAQVariation {
  question: string;
  count: number;
  lastSeen: Date;
}

export interface FAQ {
  _id: string;
  clientId: string;
  canonicalQuestion: string;
  variations: FAQVariation[];
  commonResponse: string | null;
  category: string;
  totalCount: number;
  lastSeen: Date;
  isPinned: boolean;
  customResponse: string | null;
  status: 'active' | 'archived';
  metadata?: {
    avgResponseTime?: number;
    satisfactionRate?: number;
    escalationRate?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQStats {
  totalFAQs: number;
  totalQuestions: number;
  categories: Array<{
    category: string;
    faqCount: number;
    questionCount: number;
  }>;
  topFAQs: Array<{
    _id: string;
    canonicalQuestion: string;
    totalCount: number;
    category: string;
  }>;
}

export interface AnalyzeFAQsResponse {
  success: boolean;
  message: string;
  faqs: FAQ[];
  stats: {
    messagesAnalyzed: number;
    faqsGenerated: number;
    analyzedPeriod: string;
  };
}

export interface GetFAQsResponse {
  success: boolean;
  faqs: FAQ[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
  categories: string[];
}

export const faqService = {
  /**
   * Analiza mensajes y genera FAQs usando IA
   */
  async analyzeFAQs(clientId?: string): Promise<AnalyzeFAQsResponse> {
    const response = await api.post<AnalyzeFAQsResponse>(
      '/faqs/analyze',
      {},
      { params: clientId ? { clientId } : undefined }
    );
    return response.data;
  },

  /**
   * Obtiene las FAQs existentes
   */
  async getFAQs(
    clientId?: string,
    options?: {
      status?: 'active' | 'archived';
      category?: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<GetFAQsResponse> {
    const params: Record<string, any> = { ...options };
    if (clientId) params.clientId = clientId;
    const response = await api.get<GetFAQsResponse>('/faqs', { params });
    return response.data;
  },

  /**
   * Obtiene estadísticas de FAQs
   */
  async getStats(clientId?: string): Promise<{ success: boolean; stats: FAQStats }> {
    const response = await api.get<{ success: boolean; stats: FAQStats }>(
      '/faqs/stats',
      { params: clientId ? { clientId } : undefined }
    );
    return response.data;
  },

  /**
   * Actualiza una FAQ
   */
  async updateFAQ(
    id: string,
    updates: {
      customResponse?: string;
      category?: string;
      isPinned?: boolean;
      status?: 'active' | 'archived';
    }
  ): Promise<{ success: boolean; faq: FAQ }> {
    const response = await api.put<{ success: boolean; faq: FAQ }>(
      `/faqs/${id}`,
      updates
    );
    return response.data;
  },

  /**
   * Elimina una FAQ
   */
  async deleteFAQ(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/faqs/${id}`
    );
    return response.data;
  },
};