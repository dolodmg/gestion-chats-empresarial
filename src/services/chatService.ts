// chatService.ts

import api from './api';

export interface Chat {
  chatId: string;
  clientId: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  phoneNumber: string;
  contactName: string;
  unreadCount: number;
  chatStatus: 'bot' | 'human';
  statusChangeTime?: string;
  tags: string[];
  assignedAdvisorId?: string | null;
  assignedAdvisorName?: string | null; // 🔑 NUEVO: Asesor asignado
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

export const chatService = {
  // ⬇️ MODIFICADO: Añadir skip y limit como argumentos
  async getChats(clientId: string | undefined, skip: number, limit: number): Promise<Chat[]> {
    const params: any = {
      skip, // ⬅️ NUEVO
      limit // ⬅️ NUEVO
    };

    if (clientId) {
      params.clientId = clientId;
    }

    // ⛔️ ELIMINADO: Ya no hardcodeamos los params aquí
    // params.limit = 100;
    // params.sortBy = 'lastMessageTimestamp';
    // params.sortOrder = 'desc';

    const response = await api.get('/chats', { params });
    return response.data;
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
  },

  async findChatByPhone(phoneNumber: string, clientId?: string): Promise<Chat | null> {
    try {
      const params: any = { phoneNumber };
      if (clientId) {
        params.clientId = clientId;
      }
      const response = await api.get('/chats/search/phone', { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async searchChats(query: string, clientId?: string): Promise<Chat[]> {
    try {
      const params: any = { query };
      if (clientId) {
        params.clientId = clientId;
      }
      const response = await api.get('/chats/search', { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async assignChatToAdvisor(chatId: string, advisorId: string | null): Promise<Chat> {
    const response = await api.put(`/chats/${chatId}/assign-advisor`, { advisorId });
    return response.data.chat;
  }
};