import React from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Timer from '../components/Timer';
import {
  Bot,
  User,
  Phone,
  Send,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
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
    refreshChats 
  } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = React.useState('');

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

  // Group messages by date
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
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Sort chats by last message timestamp (most recent first)
  const sortedChats = React.useMemo(() => {
    return [...chats].sort((a, b) => {
      // Handle missing timestamps
      if (!a.lastMessageTimestamp && !b.lastMessageTimestamp) return 0;
      if (!a.lastMessageTimestamp) return 1; // a goes to end
      if (!b.lastMessageTimestamp) return -1; // b goes to end
      
      // Parse dates and handle invalid dates
      const dateA = new Date(a.lastMessageTimestamp);
      const dateB = new Date(b.lastMessageTimestamp);
      
      // Check for invalid dates
      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
      
      // Sort descending (newest first)
      return timeB - timeA;
    });
  }, [chats]);

  return (
    <div className="flex h-full bg-white">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
              <p className="text-sm text-gray-600">{chats.length} chats activos</p>
            </div>
            <button
              onClick={refreshChats}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && chats.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {sortedChats.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => setActiveChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeChat?.chatId === chat.chatId ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {chat.contactName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                      </span>
                    </div>
                    {chat.chatStatus === 'bot' ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate pr-2">
                      {chat.contactName || chat.phoneNumber}
                    </h3>
                    {chat.lastMessageTimestamp && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatChatDate(chat.lastMessageTimestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">{chat.lastMessage}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {chat.chatStatus === 'bot' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Bot className="w-3 h-3 mr-1" />
                            Bot
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <User className="w-3 h-3 mr-1" />
                            Manual
                          </span>
                        )}
                        {chat.statusChangeTime && chat.chatStatus === 'human' && (
                          <Timer 
                            statusChangeTime={chat.statusChangeTime}
                            onExpire={() => toggleChatMode(chat.chatId)}
                          />
                        )}
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white min-w-[20px]">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
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
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {activeChat.contactName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeChat.contactName || activeChat.phoneNumber}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{activeChat.phoneNumber}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {activeChat.statusChangeTime && activeChat.chatStatus === 'human' && (
                    <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <Timer 
                        statusChangeTime={activeChat.statusChangeTime}
                        onExpire={() => toggleChatMode(activeChat.chatId)}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => toggleChatMode(activeChat.chatId)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeChat.chatStatus === 'bot'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {activeChat.chatStatus === 'bot' ? (
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <span>Modo Bot</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Control Manual</span>
                      </div>
                    )}
                  </button>
                  
                  {activeChat.chatStatus === 'bot' && (
                    <button
                      onClick={() => takeChatControl(activeChat.chatId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Tomar Control
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.keys(messageGroups).sort().map(dateKey => (
                <div key={dateKey}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatMessageDate(messageGroups[dateKey][0]?.timestamp)}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  {messageGroups[dateKey].map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs ${
                              message.sender === 'user'
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
    </div>
  );
}