// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import Timer from '../components/Timer';
import { useTagService } from '../hooks/useTagService';
import { TagBadge } from '../components/tags/TagBadge';
import { TagSelector } from '../components/tags/TagSelector';
import { TagManagerModal } from '../components/tags/TagManagerModal';
import { AssignAdvisorModal } from '../components/advisors/AssignAdvisorModal';
import { toast } from 'sonner';
import {
  Bot,
  User,
  Phone,
  Send,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { TagFilter } from '@/components/tags/TagFilter';

export default function Dashboard() {
  const { user } = useAuth();
  const {
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
    loadMoreChats,
    hasMore,
    isLoadingMore
  } = useChat();
  const tagService = useTagService();

  const [newMessage, setNewMessage] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(false);
  const [showMobileChatList, setShowMobileChatList] = React.useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isAssignAdvisorModalOpen, setIsAssignAdvisorModalOpen] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = React.useState<string | null>(null);

  const listRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    tagService.loadUserTags();
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setShowMobileChatList(true);
    } else {
      setShowMobileChatList(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (!activeChat && isMobile) {
      setShowMobileChatList(true);
    }
  }, [activeChat, isMobile]);

  // Handlers para tags
  const handleAddTag = async (chatId: string, tagName: string) => {
    try {
      const result = await tagService.addTagToChat(chatId, tagName);

      // Show tag added notification
      toast.success('Tag agregada', { description: `Tag "${tagName}" agregada al chat` });

      // Show Meta event notification if applicable
      if (result.metaEvent && result.metaEvent.attempted) {
        if (result.metaEvent.success) {
          toast.success('Evento enviado a Meta', {
            description: `Evento "${result.metaEvent.eventName}" enviado correctamente`
          });
        } else if (result.metaEvent.error) {
          toast.error('Error al enviar evento a Meta', {
            description: result.metaEvent.error
          });
        }
      }

      refreshChats();
    } catch (error: any) {
      toast.error('Error', { description: error.message });
    }
  };

  const handleRemoveTag = async (chatId: string, tagName: string) => {
    try {
      await tagService.removeTagFromChat(chatId, tagName);

      toast.success('Tag removida', { description: `Tag "${tagName}" removida del chat` });

      refreshChats();
    } catch (error: any) {
      toast.error('Error', { description: error.message });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatChatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';

      if (isToday(date)) {
        return formatTime(timestamp);
      } else if (isYesterday(date)) {
        return 'Ayer';
      } else {
        return format(date, 'dd/MM/yy');
      }
    } catch {
      return '';
    }
  };

  const formatMessageDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';

      if (isToday(date)) {
        return 'Hoy';
      } else if (isYesterday(date)) {
        return 'Ayer';
      } else {
        return format(date, 'EEEE, dd MMMM yyyy', { locale: es });
      }
    } catch {
      return '';
    }
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};

    messages.forEach(message => {
      try {
        const date = new Date(message.timestamp);
        if (isNaN(date.getTime())) return;

        const dateKey = format(date, 'yyyy-MM-dd');
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      } catch {
        // Skip invalid dates
      }
    });

    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const scrollMessagesToBottom = React.useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 0);
  }, []);

  React.useEffect(() => {
    if (!activeChat) return;
    scrollMessagesToBottom();
  }, [messages, activeChat?.chatId, showMobileChatList, scrollMessagesToBottom]);

  const handleChatSelect = (chat: typeof chats[number]) => {
    setActiveChat(chat);
    if (isMobile) {
      setShowMobileChatList(false);
    }
  };

  const sortedChats = React.useMemo(() => {
    return [...chats].sort((a, b) => {
      if (!a.lastMessageTimestamp && !b.lastMessageTimestamp) return 0;
      if (!a.lastMessageTimestamp) return 1;
      if (!b.lastMessageTimestamp) return -1;

      const dateA = new Date(a.lastMessageTimestamp);
      const dateB = new Date(b.lastMessageTimestamp);

      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

      return timeB - timeA;
    });
  }, [chats]);

  const availableTags = React.useMemo(() => {
    const tagMap = new Map<string, string>();

    sortedChats.forEach(chat => {
      if (chat.tags) {
        chat.tags.forEach(tagName => {
          const tag = tagService.getTag(tagName);
          if (tag && !tagMap.has(tagName)) {
            tagMap.set(tagName, tag.color);
          }
        });
      }
    });

    return Array.from(tagMap.entries()).map(([name, color]) => ({
      name,
      color
    }));
  }, [sortedChats, tagService.tags]);

  const filteredChats = React.useMemo(() => {
    if (!selectedTagFilter) {
      return sortedChats;
    }

    return sortedChats.filter(chat =>
      chat.tags && chat.tags.includes(selectedTagFilter)
    );
  }, [sortedChats, selectedTagFilter]);

  const handleScroll = () => {
    const target = listRef.current;
    if (target) {
      const { scrollTop, scrollHeight, clientHeight } = target;

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMoreChats();
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col lg:flex-row min-h-0 bg-white relative">
      {/* Chat List */}
      <div
        className={`${isMobile && !showMobileChatList ? 'hidden' : 'flex'
          } w-full lg:w-1/3 border-gray-200 flex flex-col border-b lg:border-b-0 lg:border-r min-h-0 
        absolute inset-0 lg:static lg:inset-auto z-10`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Conversaciones</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTagManagerOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Configurar tags"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={refreshChats}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Actualizar chats"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filter */}
        <TagFilter
          availableTags={availableTags}
          selectedTag={selectedTagFilter}
          onTagSelect={(tagName) => setSelectedTagFilter(tagName)}
          chatCount={selectedTagFilter ? filteredChats.length : undefined}
        />

        {/* Chat List con scroll infinito */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {error && (
            <div className="m-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {isLoading && chats.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => handleChatSelect(chat)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${activeChat?.chatId === chat.chatId ? 'bg-blue-50' : ''
                  }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {chat.contactName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.contactName || chat.phoneNumber}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatChatDate(chat.lastMessageTimestamp)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{chat.phoneNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate pr-2">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Tags del chat */}
                    {chat.tags && chat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chat.tags.map(tagName => {
                          const tag = tagService.getTag(tagName);
                          return (
                            <TagBadge
                              key={tagName}
                              name={tagName}
                              color={tag?.color || '#6B7280'}
                              size="sm"
                            />
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {chat.chatStatus === 'bot' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Bot className="w-3 h-3 mr-1" />
                          Bot
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <User className="w-3 h-3 mr-1" />
                          Manual
                        </span>
                      )}

                      {/* Asesor asignado */}
                      {chat.assignedAdvisorName && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <User className="w-3 h-3 mr-1" />
                          {chat.assignedAdvisorName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}

          {isLoadingMore && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!isLoadingMore && !hasMore && chats.length > 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">Fin de las conversaciones</p>
            </div>
          )}

          {!isLoading && chats.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MoreHorizontal className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay chats disponibles</h3>
              <p className="text-gray-600">Los chats aparecerán aquí cuando lleguen mensajes</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${isMobile && showMobileChatList ? 'hidden' : 'flex'
          } flex-1 flex flex-col min-h-0 
        absolute inset-0 lg:static lg:inset-auto`}
      >
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setShowMobileChatList(true)}
                      className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {activeChat.contactName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {activeChat.contactName || activeChat.phoneNumber}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{activeChat.phoneNumber}</span>
                    </div>
                  </div>

                  {/* Tag Selector en el header */}
                  <TagSelector
                    availableTags={tagService.tags}
                    selectedTags={activeChat.tags || []}
                    onTagAdd={(tagName) => handleAddTag(activeChat.chatId, tagName)}
                    onTagRemove={(tagName) => handleRemoveTag(activeChat.chatId, tagName)}
                    {...(user?.role !== 'advisor' && { onCreateTag: () => setIsTagManagerOpen(true) })}
                  />

                  {/* Assign Advisor Button */}
                  {(user?.role === 'client' || user?.role === 'admin') && (
                    <button
                      onClick={() => setIsAssignAdvisorModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Asignar Asesor
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  {activeChat.statusChangeTime && activeChat.chatStatus === 'human' && (
                    <div className="flex items-center justify-between sm:justify-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <Timer
                        statusChangeTime={activeChat.statusChangeTime}
                        onExpire={() => toggleChatMode(activeChat.chatId)}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => toggleChatMode(activeChat.chatId)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto flex items-center justify-center gap-2 ${activeChat.chatStatus === 'bot'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                  >
                    {activeChat.chatStatus === 'bot' ? (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Modo Bot</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span>Devolver al bot</span>
                      </>
                    )}
                  </button>

                  {activeChat.chatStatus === 'bot' && (
                    <button
                      onClick={() => takeChatControl(activeChat.chatId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      Tomar Control
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {Object.keys(messageGroups).sort().map(dateKey => (
                <div key={dateKey}>
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatMessageDate(messageGroups[dateKey][0]?.timestamp)}
                    </div>
                  </div>

                  {messageGroups[dateKey].map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${message.sender === 'user'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-500 text-white'
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs ${message.sender === 'user'
                              ? 'text-gray-500'
                              : 'text-white text-opacity-75'
                              }`}
                          >
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'bot' && (
                            <span className="text-xs ml-2 text-white text-opacity-75">
                              Bot
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Message Input */}
            {activeChat.chatStatus === 'human' ? (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribir mensaje..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Chat en modo automático - Toma control para enviar mensajes"
                    disabled
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 text-gray-500"
                  />
                  <button
                    disabled
                    className="p-2 bg-gray-400 text-white rounded-full cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MoreHorizontal className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
              <p className="text-gray-600">Elige un chat de la lista para comenzar a conversar</p>
            </div>
          </div>
        )}
      </div>

      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={tagService.tags}
        readOnly={user?.role === 'advisor'}
        onCreateTag={async (name, color) => {
          await tagService.createTag(name, color);
          toast.success('Tag creada', { description: `Tag "${name}" creada exitosamente` });
        }}
        onDeleteTag={async (tagName) => {
          await tagService.deleteTag(tagName);
          toast.success('Tag eliminada', { description: `Tag "${tagName}" eliminada` });
          refreshChats(); // Actualizar chats para reflejar cambios
        }}
        onUpdateTagColor={async (tagName, color) => {
          await tagService.updateTag(tagName, color);
          toast.success('Color actualizado', { description: `Color de "${tagName}" actualizado` });
          refreshChats(); // Actualizar chats para ver nuevo color
        }}
      />

      {/* Assign Advisor Modal */}
      {activeChat && (
        <AssignAdvisorModal
          isOpen={isAssignAdvisorModalOpen}
          onClose={() => setIsAssignAdvisorModalOpen(false)}
          chatId={activeChat.chatId}
          currentAdvisorId={activeChat.assignedAdvisorId}
          currentAdvisorName={activeChat.assignedAdvisorName}
          onAssignmentComplete={(advisorId, advisorName) => {
            // Update the active chat with new assignment
            setActiveChat({
              ...activeChat,
              assignedAdvisorId: advisorId,
              assignedAdvisorName: advisorName
            });
            // Refresh chats list to show updated assignment
            refreshChats();
          }}
        />
      )}
    </div>
  );
}