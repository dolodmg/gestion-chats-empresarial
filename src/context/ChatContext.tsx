// ChatContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { chatService, Chat, Message } from '../services/chatService';
import { useAuth } from './AuthContext';
import sseService from '../services/sseService';
import { ManualControlOption } from '@/utils/manualControl';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setActiveChat: (chat: Chat) => void;
  toggleChatMode: (chatId: string) => void;
  sendMessage: (content: string) => void;
  sendMediaMessage: (file: File, caption?: string) => void;
  takeChatControl: (chatId: string, option?: ManualControlOption) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  refreshChats: () => void;
  loadMoreChats: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  navigateToChatByPhone: (phoneNumber: string) => Promise<boolean>;
  searchChats: (query: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  searchResults: Chat[];
  isSearchActive: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_PAGE_LIMIT = 50;

function isRealContactName(contactName?: string | null, phoneNumber?: string | null) {
  const normalizedName = String(contactName || '').trim();
  const normalizedPhone = String(phoneNumber || '').replace(/\D/g, '');

  if (!normalizedName || normalizedName === 'Usuario Prueba') {
    return false;
  }

  return normalizedName.replace(/\D/g, '') !== normalizedPhone;
}

function mergeChatPreservingName(currentChat: Chat, incomingChat: Partial<Chat>) {
  const mergedChat = { ...currentChat, ...incomingChat };
  const incomingPhoneNumber = incomingChat.phoneNumber ?? currentChat.phoneNumber;

  if (!isRealContactName(incomingChat.contactName, incomingPhoneNumber) && isRealContactName(currentChat.contactName, currentChat.phoneNumber)) {
    mergedChat.contactName = currentChat.contactName;
  }

  return mergedChat;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token');
  const hasLoadedChatsOnceRef = useRef(false);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const activeChatRef = useRef<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Chat[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const refreshChats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    const shouldShowBlockingError = !hasLoadedChatsOnceRef.current;
    if (shouldShowBlockingError) {
      setError(null);
    }

    try {
      const clientId = user.role === 'admin' ? undefined : user.clientId;
      const chatList = await chatService.getChats(clientId, 0, CHAT_PAGE_LIMIT);

      hasLoadedChatsOnceRef.current = true;
      setChats(chatList);
      setError(null);
      setActiveChat(prevActive => {
        if (!prevActive) {
          return prevActive;
        }

        const refreshedActiveChat = chatList.find(chat => chat.chatId === prevActive.chatId);
        return refreshedActiveChat ? mergeChatPreservingName(prevActive, refreshedActiveChat) : prevActive;
      });
      setSkip(chatList.length);
      setHasMore(chatList.length === CHAT_PAGE_LIMIT);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar chats';

      if (shouldShowBlockingError) {
        setError(errorMessage);
      } else {
        console.warn('Error refrescando chats en segundo plano:', errorMessage, error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadChatMessages = useCallback(async (chatId: string) => {
    try {
      const chatWithMessages = await chatService.getChatWithMessages(chatId);
      setActiveChat(prevActive =>
        prevActive && prevActive.chatId === chatId
          ? mergeChatPreservingName(prevActive, chatWithMessages.chat)
          : prevActive
      );
      setChats(prevChats =>
        prevChats.map(existingChat =>
          existingChat.chatId === chatId
            ? mergeChatPreservingName(existingChat, chatWithMessages.chat)
            : existingChat
        )
      );
      // ✅ Ordenar mensajes por timestamp al cargarlos
      const sortedMessages = chatWithMessages.messages.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setMessages(sortedMessages);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar mensajes');
    }
  }, []);



  // 🆕 Envolver los handlers de SSE en useCallback
  // Reemplaza tu 'handleNewMessage' (líneas 74-126)
  const handleNewMessage = useCallback((data: any) => {
    const { chatId, sender, content, timestamp } = data;
    const currentActiveChat = activeChatRef.current;

    if (currentActiveChat?.chatId === chatId) {
      loadChatMessages(chatId);
    }

    // Actualizar lista de chats (último mensaje)
    setChats(prevChats => {
      const existingChat = prevChats.find(c => c.chatId === chatId);

      if (existingChat) {
        return [
          {
            ...existingChat,
            lastMessage: content,
            lastMessageTimestamp: timestamp,
            unreadCount: (activeChatRef.current?.chatId === chatId || sender !== 'user')
              ? existingChat.unreadCount
              : existingChat.unreadCount + 1
          },
          ...prevChats.filter(c => c.chatId !== chatId)
        ];
      }

      // Si es un chat nuevo, hacer refresh
      refreshChats();
      return prevChats;
    });
  }, [refreshChats, loadChatMessages]);

  const handleChatStatusChanged = useCallback((data: any) => {
    const {
      chatId,
      chatStatus,
      statusChangeTime,
      manualControlLocked,
      manualControlOption,
      manualControlExpiresAt
    } = data;

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.chatId === chatId
          ? {
            ...chat,
            chatStatus,
            statusChangeTime,
            manualControlLocked,
            manualControlOption,
            manualControlExpiresAt
          }
          : chat
      )
    );

    setActiveChat(prev => prev?.chatId === chatId ? {
        ...prev,
        chatStatus,
        statusChangeTime,
        manualControlLocked,
        manualControlOption,
        manualControlExpiresAt
      } : prev);
  }, []);

  const handleChatUpdated = useCallback((data: any) => {
    setChats(prevChats => {
      const existingChat = prevChats.find(chat => chat.chatId === data.chatId);

      if (!existingChat) {
        refreshChats();
        return prevChats;
      }

      const updatedChat = mergeChatPreservingName(existingChat, data);

      return [
        updatedChat,
        ...prevChats.filter(chat => chat.chatId !== data.chatId)
      ];
    });

    setActiveChat(prev => prev?.chatId === data.chatId
      ? mergeChatPreservingName(prev, data)
      : prev
    );
  }, [refreshChats]);

  const sseHandlersRef = useRef({
    handleNewMessage,
    handleChatStatusChanged,
    handleChatUpdated
  });

  useEffect(() => {
    sseHandlersRef.current = {
      handleNewMessage,
      handleChatStatusChanged,
      handleChatUpdated
    };
  }, [handleNewMessage, handleChatStatusChanged, handleChatUpdated]);

  const userId = user?._id;

  useEffect(() => {
    if (!userId || !token) return;

    void sseService.connect();

    const unsubscribe = sseService.subscribe((event) => {
      const handlers = sseHandlersRef.current;

      switch (event.type) {
        case 'new_message':
          handlers.handleNewMessage(event.data);
          break;
        case 'chat_status_changed':
          handlers.handleChatStatusChanged(event.data);
          break;
        case 'chat_updated':
          handlers.handleChatUpdated(event.data);
          break;
      }
    });

    return () => {
      unsubscribe();
      sseService.disconnect();
    };
  }, [userId, token]);


  // Reemplaza tu 'loadMoreChats' (líneas 190-212)
  const loadMoreChats = useCallback(async () => {
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
  }, [isLoading, isLoadingMore, hasMore, user, skip]); // 👈 Añadir useCallback y dependencias



  // Reemplaza tu useEffect de 'user' (línea 214)
  useEffect(() => {
    if (user) {
      hasLoadedChatsOnceRef.current = false;
      refreshChats();
    } else {
      hasLoadedChatsOnceRef.current = false;
    }
  }, [user, refreshChats]);

  const activeChatId = activeChat?.chatId;

  useEffect(() => {
    if (activeChatId) {
      loadChatMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId, loadChatMessages]);

  // Reemplaza tu 'toggleChatMode' (líneas 230-256)
  const toggleChatMode = useCallback(async (chatId: string) => {
    const chat = activeChat?.chatId === chatId ? activeChat : chats.find(c => c.chatId === chatId);
    if (!chat) return;

    const newStatus = chat.chatStatus === 'bot' ? 'human' : 'bot';

    try {
      const partialUpdate = await chatService.changeChatStatus(chatId, newStatus);

      setChats(prevChats =>
        prevChats.map(c =>
          c.chatId === chatId ? { ...c, ...partialUpdate } : c
        )
      );

      if (activeChat?.chatId === chatId) {
        setActiveChat(prevActive => prevActive ? { ...prevActive, ...partialUpdate } : null);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cambiar modo del chat');
    }
  }, [chats, activeChat]); // 👈 Añadir useCallback y dependencias

  // Reemplaza tu 'sendMessage' (líneas 258-284)
  const sendMessage = useCallback(async (content: string) => {
    if (!activeChat) return;

    try {
      // ✅ NO agregar el mensaje optimísticamente - esperar la respuesta del servidor
      const newMessage = await chatService.sendMessage(activeChat.chatId, content);

      console.log('📤 Mensaje enviado, respuesta:', newMessage);

      // ✅ Agregar el mensaje SOLO si no llegó ya por SSE
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) {
          console.log('⚠️ Mensaje ya existe (llegó por SSE primero)');
          return prev;
        }

        const newMessages = [...prev, newMessage];

        // Ordenar por timestamp
        return newMessages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      // Actualizar el último mensaje en la lista de chats
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chatId === activeChat.chatId
            ? {
              ...chat,
              lastMessage: content,
              lastMessageTimestamp: newMessage.timestamp
            }
            : chat
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al enviar mensaje');
      console.error('❌ Error al enviar mensaje:', error);
    }
  }, [activeChat]); // 👈 Añadir useCallback y dependencias

  // Enviar mensaje con archivo adjunto
  const sendMediaMessage = useCallback(async (file: File, caption?: string) => {
    if (!activeChat) return;

    try {
      const newMessage = await chatService.sendMediaMessage(activeChat.chatId, file, caption);

      console.log('📤 Media enviado, respuesta:', newMessage);

      // Agregar el mensaje SOLO si no llegó ya por SSE
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) {
          console.log('⚠️ Mensaje ya existe (llegó por SSE primero)');
          return prev;
        }

        const newMessages = [...prev, newMessage];
        return newMessages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      // Actualizar el último mensaje en la lista de chats
      const displayText = caption || (file ? `📎 ${file.name}` : '[archivo]');
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chatId === activeChat.chatId
            ? {
              ...chat,
              lastMessage: displayText,
              lastMessageTimestamp: newMessage.timestamp
            }
            : chat
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al enviar archivo');
      console.error('❌ Error al enviar archivo:', error);
    }
  }, [activeChat]);

  // Reemplaza tu 'takeChatControl' (líneas 286-302)
  const takeChatControl = useCallback(async (
    chatId: string,
    option: ManualControlOption = '30m'
  ) => {
    try {
      const partialUpdate = await chatService.changeChatStatus(chatId, 'human', option);

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chatId === chatId ? { ...chat, ...partialUpdate } : chat
        )
      );

      if (activeChat?.chatId === chatId) {
        setActiveChat(prevActive => prevActive ? { ...prevActive, ...partialUpdate } : null);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al tomar control del chat');
    }
  }, [activeChat]); // 👈 Añadir useCallback y dependencias


  // Eliminar un mensaje
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      // Actualizar estado local
      setMessages(prev => prev.filter(msg => msg.id !== messageId && msg._id !== messageId));
    } catch (error: any) {
      console.error('Error al eliminar mensaje:', error);
      throw error;
    }
  }, []);

  // Eliminar un chat completo
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      // Actualizar estado local
      setChats(prev => prev.filter(chat => chat.chatId !== chatId));
      if (activeChat?.chatId === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error al eliminar chat:', error);
      throw error;
    }
  }, [activeChat]);

  // Función para navegar a un chat por número de teléfono
  const navigateToChatByPhone = useCallback(async (phoneNumber: string): Promise<boolean> => {
    console.log('🔍 Buscando chat para número:', phoneNumber);
    console.log('📋 Total de chats disponibles:', chats.length);

    // Normalizar el número de teléfono (eliminar espacios, guiones, paréntesis, etc.)
    const normalizePhone = (phone: string): string => {
      return phone.replace(/[\s\-\(\)\+]/g, '');
    };

    const normalizedInput = normalizePhone(phoneNumber);
    console.log('🔢 Número normalizado buscado:', normalizedInput);

    // Buscar el chat que coincida con el número de teléfono
    let matchingChat = chats.find(chat => {
      const normalizedChatPhone = normalizePhone(chat.phoneNumber);
      console.log(`  Comparando con chat: ${chat.phoneNumber} (normalizado: ${normalizedChatPhone})`);

      // Comparar de múltiples formas
      const exactMatch = normalizedChatPhone === normalizedInput;
      const endsWithInput = normalizedChatPhone.endsWith(normalizedInput);
      const inputEndsWithChat = normalizedInput.endsWith(normalizedChatPhone);
      const containsInput = normalizedChatPhone.includes(normalizedInput);
      const inputContainsChat = normalizedInput.includes(normalizedChatPhone);

      const isMatch = exactMatch || endsWithInput || inputEndsWithChat || containsInput || inputContainsChat;

      if (isMatch) {
        console.log('✅ MATCH ENCONTRADO!', {
          exactMatch,
          endsWithInput,
          inputEndsWithChat,
          containsInput,
          inputContainsChat
        });
      }

      return isMatch;
    });

    // Si no se encuentra en los chats cargados, buscar en el backend
    if (!matchingChat) {
      console.log('🌐 No encontrado en chats cargados, buscando en backend...');
      try {
        const clientId = user?.role === 'admin' ? undefined : user?.clientId;
        const foundChat = await chatService.findChatByPhone(phoneNumber, clientId);
        if (foundChat) {
          matchingChat = foundChat;
        }
      } catch (error) {
        console.error('❌ Error al buscar en backend:', error);
      }
    }

    if (matchingChat) {
      console.log('✅ Chat encontrado:', matchingChat);
      // Establecer el chat activo directamente
      setActiveChat(matchingChat);
      // Resetear el unreadCount y agregar a la lista si no está
      setChats(prevChats => {
        const exists = prevChats.some(c => c.chatId === matchingChat.chatId);
        if (exists) {
          return prevChats.map(c =>
            c.chatId === matchingChat.chatId
              ? { ...c, unreadCount: 0 }
              : c
          );
        }
        // Si no está en la lista, agregarlo al principio
        return [{ ...matchingChat, unreadCount: 0 }, ...prevChats];
      });
      return true;
    }

    console.log('❌ No se encontró ningún chat que coincida');
    return false;
  }, [chats, user]);


  // Agregar esta función ANTES del return del ChatProvider
  const handleSetActiveChat = useCallback((chat: Chat) => {
    // Establecer el chat activo
    setActiveChat(chat);

    // Resetear el unreadCount del chat seleccionado
    setChats(prevChats =>
      prevChats.map(c =>
        c.chatId === chat.chatId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  }, []);

  // Search chats function
  const searchChats = useCallback(async (query: string) => {
    if (!user || query.trim().length === 0) {
      setSearchResults([]);
      setIsSearchActive(false);
      return;
    }

    setIsSearching(true);
    setIsSearchActive(true);
    setError(null);

    try {
      const clientId = user.role === 'admin' ? undefined : user.clientId;
      const results = await chatService.searchChats(query, clientId);
      setSearchResults(results);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al buscar chats');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearchActive(false);
    setIsSearching(false);
  }, []);

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      messages,
      isLoading,
      error,
      setActiveChat: handleSetActiveChat,  // ✅ CAMBIO: Usar función personalizada
      toggleChatMode,
      sendMessage,
      sendMediaMessage,
      takeChatControl,
      deleteMessage,
      deleteChat,
      refreshChats,
      loadMoreChats,
      hasMore,
      isLoadingMore,
      navigateToChatByPhone,
      searchChats,
      clearSearch,
      isSearching,
      searchResults,
      isSearchActive
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
