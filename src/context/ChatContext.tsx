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
  loadMoreChats: () => void;
  loadOlderMessages: () => void;
  hasMoreChats: boolean;
  hasMoreMessages: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Estado de chats
  const [chats, setChats] = useState<Chat[]>([]);
  const [pageChats, setPageChats] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  // Estado del chat activo
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Estado de mensajes
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageMessages, setPageMessages] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Estado general
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatsPage = async (page = 1) => {
    if (!user) return;
    try {
      const clientId = user.role === 'admin' ? undefined : user.clientId;
      const res = await chatService.getChatsPaginated(page, 20, clientId);

      if (page === 1) {
        setChats(res.data);
      } else {
        setChats((prev) => [...prev, ...res.data]);
      }

      setHasMoreChats(res.pagination.hasMore);
      setPageChats(page);
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || 'Error al cargar chats');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshChats = async () => {
    setIsLoading(true);
    await fetchChatsPage(1);
    setIsLoading(false);
  };

  const loadMoreChats = async () => {
    if (!hasMoreChats) return;
    await fetchChatsPage(pageChats + 1);
  };

  const fetchMessagesPage = async (chatId: string, page = 1) => {
    try {
      const res = await chatService.getMessagesPaginated(chatId, page, 50);

      if (page === 1) {
        setMessages(res.data);
      } else {
        // Los más viejos van al principio
        setMessages((prev) => [...res.data, ...prev]);
      }

      setHasMoreMessages(res.pagination.hasMore);
      setPageMessages(page);
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.message || 'Error al cargar mensajes');
    }
  };

  const loadOlderMessages = async () => {
    if (!activeChat || !hasMoreMessages) return;
    await fetchMessagesPage(activeChat.chatId, pageMessages + 1);
  };

  useEffect(() => {
    if (user) refreshChats();
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      setMessages([]);
      setPageMessages(1);
      setHasMoreMessages(true);
      fetchMessagesPage(activeChat.chatId, 1);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    if (!user || chats.length === 0) return;

    const hasHumanChats = chats.some((c) => c.chatStatus === 'human');
    const interval = setInterval(refreshChats, hasHumanChats ? 10000 : 30000);
    return () => clearInterval(interval);
  }, [user, chats]);

  const toggleChatMode = async (chatId: string) => {
    const chat = chats.find((c) => c.chatId === chatId);
    if (!chat) return;

    const newStatus = chat.chatStatus === 'bot' ? 'human' : 'bot';
    try {
      const updatedChat = await chatService.changeChatStatus(chatId, newStatus);
      setChats((prev) =>
        prev.map((c) => (c.chatId === chatId ? updatedChat : c))
      );
      if (activeChat?.chatId === chatId) setActiveChat(updatedChat);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cambiar modo del chat');
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeChat) return;
    try {
      const newMessage = await chatService.sendMessage(activeChat.chatId, content);
      setMessages((prev) => [...prev, newMessage]);
      setChats((prev) =>
        prev.map((chat) =>
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
      setChats((prev) =>
        prev.map((chat) => (chat.chatId === chatId ? updatedChat : chat))
      );
      if (activeChat?.chatId === chatId) setActiveChat(updatedChat);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al tomar control del chat');
    }
  };

  return (
    <ChatContext.Provider
      value={{
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

        // nuevos métodos
        loadMoreChats,
        loadOlderMessages,
        hasMoreChats,
        hasMoreMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
