import api from './api';

export interface Chat {
  chatId: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  phoneNumber: string;
  contactName: string;
  unreadCount: number;
  chatStatus: 'bot' | 'human';
  statusChangeTime?: string;
}

export interface Message {
  id: string;
  chatId: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatWithMessages {
  chat: Chat;
  messages: Message[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const chatService = {
  async getChatsPaginated(page = 1, limit = 20, clientId?: string): Promise<PaginatedResponse<Chat>> {
    const params: any = { page, limit };
    if (clientId) params.clientId = clientId;

    const response = await api.get('/chats', { params });

    return {
      data: response.data.chats || [],
      pagination: response.data.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1,
        hasMore: false
      }
    };
  },

  async getMessagesPaginated(chatId: string, page = 1, limit = 50): Promise<PaginatedResponse<Message>> {
    const response = await api.get(`/chats/${chatId}`, {
      params: { page, limit }
    });

    return {
      data: response.data.messages || [],
      pagination: response.data.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1,
        hasMore: false
      }
    };
  },

  async getChats(clientId?: string): Promise<Chat[]> {
    const params: any = {};
    if (clientId) params.clientId = clientId;

    const response = await api.get('/chats', { params });
    return response.data.chats || response.data; 
  },

  async getChatWithMessages(chatId: string): Promise<ChatWithMessages> {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  async changeChatStatus(chatId: string, status: 'bot' | 'human'): Promise<Chat> {
    const response = await api.post(`/chats/${chatId}/status`, { status });
    return response.data;
  },

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const response = await api.post(`/chats/${chatId}/message`, { content });
    return response.data.message;
  }
};
