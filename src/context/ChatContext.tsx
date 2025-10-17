import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService, Chat, Message } from '../services/chatService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setActiveChat: (chat: Chat) => void;
  toggleChatMode: (chatId: string) => void;
  sendMessage: (content: string) => void;
  takeChatControl: (chatId: string) => void;
  refreshChats: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshChats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const clientId = user.role === 'admin' ? undefined : user.clientId;
      const chatList = await chatService.getChats(clientId);
      setChats(chatList);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar chats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatMessages = async (chat: Chat) => {
    try {
      const chatWithMessages = await chatService.getChatWithMessages(chat.chatId);
      setMessages(chatWithMessages.messages);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar mensajes');
    }
  };

  useEffect(() => {
    if (user) {
      refreshChats();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      loadChatMessages(activeChat);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  // Auto-refresh chats based on status
  useEffect(() => {
    if (!user || chats.length === 0) return;

    const hasHumanChats = chats.some(chat => chat.chatStatus === 'human');
    const refreshInterval = hasHumanChats ? 10000 : 30000; // 10s for human, 30s for bot

    const interval = setInterval(refreshChats, refreshInterval);
    return () => clearInterval(interval);
  }, [user, chats]);

  const toggleChatMode = async (chatId: string) => {
    const chat = chats.find(c => c.chatId === chatId);
    if (!chat) return;

    const newStatus = chat.chatStatus === 'bot' ? 'human' : 'bot';
    
    try {
      const updatedChat = await chatService.changeChatStatus(chatId, newStatus);
      setChats(prevChats =>
        prevChats.map(c => c.chatId === chatId ? updatedChat : c)
      );
      
      if (activeChat?.chatId === chatId) {
        setActiveChat(updatedChat);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cambiar modo del chat');
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeChat) return;

    try {
      const newMessage = await chatService.sendMessage(activeChat.chatId, content);
      setMessages(prev => [...prev, newMessage]);
      
      // Update last message in chat list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chatId === activeChat.chatId
            ? { ...chat, lastMessage: content, lastMessageTimestamp: newMessage.timestamp }
            : chat
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al enviar mensaje');
    }
  };

  const takeChatControl = async (chatId: string) => {
    try {
      const updatedChat = await chatService.changeChatStatus(chatId, 'human');
      setChats(prevChats =>
        prevChats.map(chat => chat.chatId === chatId ? updatedChat : chat)
      );
      
      if (activeChat?.chatId === chatId) {
        setActiveChat(updatedChat);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al tomar control del chat');
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      messages,
      isLoading,
      error,
      setActiveChat,
      toggleChatMode,
      sendMessage,
      takeChatControl,
      refreshChats
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}