// ChatContext.tsx

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
  loadMoreChats: () => void; // Para scroll infinito
  hasMore: boolean; // Para scroll infinito
  isLoadingMore: boolean; // Para scroll infinito
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Límite de chats por página (debe coincidir con el default del backend)
const CHAT_PAGE_LIMIT = 50;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para paginación
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // refreshChats (Carga la PRIMERA página)
  const refreshChats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const clientId = user.role === 'admin' ? undefined : user.clientId;
      const chatList = await chatService.getChats(clientId, 0, CHAT_PAGE_LIMIT);
      
      setChats(chatList);
      setSkip(chatList.length);
      setHasMore(chatList.length === CHAT_PAGE_LIMIT);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar chats');
    } finally {
      setIsLoading(false);
    }
  };

  // loadMoreChats (Carga páginas SIGUIENTES)
  const loadMoreChats = async () => {
    if (isLoading || isLoadingMore || !hasMore || !user) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const clientId = user.role === 'admin' ? undefined : user.clientId;
      const newChats = await chatService.getChats(clientId, skip, CHAT_PAGE_LIMIT);

      if (newChats.length > 0) {
        setChats(prevChats => [...prevChats, ...newChats]);
        setSkip(prevSkip => prevSkip + newChats.length);
      }
      
      setHasMore(newChats.length === CHAT_PAGE_LIMIT);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar más chats');
    } finally {
      setIsLoadingMore(false);
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

  // ⬇️ *** INICIO DE LA CORRECCIÓN *** ⬇️

  const toggleChatMode = async (chatId: string) => {
    const chat = chats.find(c => c.chatId === chatId);
    if (!chat) return;

    const newStatus = chat.chatStatus === 'bot' ? 'human' : 'bot';
    
    try {
      // La API devuelve un objeto PARCIAL: { chatId, chatStatus, statusChangeTime }
      const partialUpdate = await chatService.changeChatStatus(chatId, newStatus);
      
      setChats(prevChats =>
        prevChats.map(c =>
          c.chatId === chatId
            // FIX: Combinamos el chat existente (...) con la actualización parcial
            ? { ...c, ...partialUpdate } 
            : c
        )
      );
      
      if (activeChat?.chatId === chatId) {
        // Hacemos lo mismo para el chat activo
        setActiveChat(prevActive => prevActive ? { ...prevActive, ...partialUpdate } : null);
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
      // La API devuelve un objeto PARCIAL: { chatId, chatStatus, statusChangeTime }
      const partialUpdate = await chatService.changeChatStatus(chatId, 'human');

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chatId === chatId
            // FIX: Combinamos el chat existente (...) con la actualización parcial
            ? { ...chat, ...partialUpdate } 
            : chat
        )
      );
      
      if (activeChat?.chatId === chatId) {
        // Hacemos lo mismo para el chat activo
        setActiveChat(prevActive => prevActive ? { ...prevActive, ...partialUpdate } : null);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al tomar control del chat');
    }
  };

  // ⬆️ *** FIN DE LA CORRECCIÓN *** ⬆️

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
      refreshChats,
      loadMoreChats, // Añadido para scroll infinito
      hasMore, // Añadido para scroll infinito
      isLoadingMore // Añadido para scroll infinito
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