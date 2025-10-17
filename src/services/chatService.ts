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

export const chatService = {
  async getChats(clientId?: string): Promise<Chat[]> {
    const params: any = {};
    
    if (clientId) {
      params.clientId = clientId;
    }
    
    // Agregar parámetros para obtener todos los chats recientes
    params.limit = 100; // Aumentar límite
    params.sortBy = 'lastMessageTimestamp';
    params.sortOrder = 'desc';
    
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
  }
};