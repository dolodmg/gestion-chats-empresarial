// src/pages/Dashboard.tsx
import React, { useState, useRef } from 'react';
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
  Tag,
  FileText,
  MessageSquareText,
  Download,
  Search,
  Paperclip,
  X,
  Image,
  FileIcon,
  Film,
  Mic,
  Trash2,
  Sparkles,
  ImagePlus
} from 'lucide-react';
import { TagFilter } from '@/components/tags/TagFilter';
import { ChatSummaryModal } from '@/components/summaries/ChatSummaryModal';
import { SendTemplateModal } from '@/components/templates/SendTemplateModal';
import { ExportChatsModal } from '@/components/chats/ExportChatsModal';
import { ChatSearchBar } from '@/components/chats/ChatSearchBar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { chatService } from '../services/chatService';
import { stickerService, type CustomSticker, type PresetSticker } from '../services/stickerService';
import { isFeatureEnabled } from '@/utils/featureFlags';

function EmojiIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
    </svg>
  );
}

function StickerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M7 3h7l5 5v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
    </svg>
  );
}

const DEFAULT_PRESET_STICKERS: PresetSticker[] = [
  { id: 'preset-hola', name: 'Hola', emoji: '👋', accent: '#dff7e8', textColor: '#17603a', category: 'saludos' },
  { id: 'preset-gracias', name: 'Gracias', emoji: '🙏', accent: '#fff1bf', textColor: '#7a5b00', category: 'saludos' },
  { id: 'preset-ok', name: 'Ok', emoji: '👌', accent: '#dbeafe', textColor: '#18406b', category: 'rapidas' },
  { id: 'preset-genial', name: 'Genial', emoji: '✨', accent: '#fce7f3', textColor: '#7a2858', category: 'rapidas' },
  { id: 'preset-urgente', name: 'Urgente', emoji: '⚡', accent: '#fee2e2', textColor: '#8a1c1c', category: 'gestion' },
  { id: 'preset-volvemos', name: 'Volvemos', emoji: '⏳', accent: '#ede9fe', textColor: '#4d2b87', category: 'gestion' },
  { id: 'preset-oferta', name: 'Oferta', emoji: '🔥', accent: '#ffedd5', textColor: '#8a3a13', category: 'ventas' },
  { id: 'preset-promo', name: 'Promo', emoji: '🎉', accent: '#dcfce7', textColor: '#166534', category: 'ventas' },
  { id: 'preset-envio', name: 'Enviado', emoji: '📦', accent: '#e0f2fe', textColor: '#0f4c75', category: 'gestion' },
  { id: 'preset-pago', name: 'Pago', emoji: '💸', accent: '#fef3c7', textColor: '#854d0e', category: 'ventas' },
  { id: 'preset-amor', name: 'Gracias', emoji: '❤️', accent: '#ffe4e6', textColor: '#9f1239', category: 'saludos' },
  { id: 'preset-idea', name: 'Idea', emoji: '💡', accent: '#fef9c3', textColor: '#854d0e', category: 'rapidas' }
];

const EMOJI_GROUPS = [
  ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '🙂', '😉', '😍', '😘', '😗', '😙', '😚', '😋', '😜', '🤪', '😝', '🤗', '🤩', '😎', '🥳'],
  ['😌', '😏', '😴', '🤤', '😪', '😵', '🤯', '😬', '😳', '🥺', '😭', '😡', '🤬', '😱', '😨', '😰', '😥', '😓', '🫠', '🤔', '🫡', '🤝', '🙏', '👏'],
  ['👍', '👎', '👌', '✌️', '🤞', '🫶', '👋', '🙌', '💪', '👀', '🧠', '🫀', '❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❤️‍🔥', '💯', '✨', '🔥'],
  ['🎉', '🎊', '✅', '❌', '⚠️', '⭐', '🌟', '💫', '⚡', '💥', '💬', '📢', '📌', '📦', '🎁', '💸', '💳', '🛒', '📲', '📞', '📅', '⏳', '⌛', '🚀']
];

export default function Dashboard() {
  const { user } = useAuth();
  const canManageAdvisors = isFeatureEnabled(user?.role, 'advisors', user?.featureFlags);
  const canSendTemplates = isFeatureEnabled(user?.role, 'sendTemplates', user?.featureFlags);
  const canViewConversationSummary = isFeatureEnabled(user?.role, 'conversationSummary', user?.featureFlags);
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
    isLoadingMore,
    searchChats,
    clearSearch,
    isSearching,
    searchResults,
    isSearchActive,
    deleteMessage,
    deleteChat
  } = useChat();
  const { sendMediaMessage } = useChat();
  const tagService = useTagService();

  const [newMessage, setNewMessage] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(false);
  const [showMobileChatList, setShowMobileChatList] = React.useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isAssignAdvisorModalOpen, setIsAssignAdvisorModalOpen] = useState(false);
  const [isSendTemplateModalOpen, setIsSendTemplateModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = React.useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; fileName?: string } | null>(null);
  const [deleteChatDialog, setDeleteChatDialog] = useState<{ isOpen: boolean; chatId: string }>({ isOpen: false, chatId: '' });
  const [deleteMessageDialog, setDeleteMessageDialog] = useState<{ isOpen: boolean; messageId: string }>({ isOpen: false, messageId: '' });

  const listRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [isCreateStickerModalOpen, setIsCreateStickerModalOpen] = useState(false);
  const [presetStickers, setPresetStickers] = useState<PresetSticker[]>(DEFAULT_PRESET_STICKERS);
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([]);
  const [createdStickerFile, setCreatedStickerFile] = useState<File | null>(null);
  const [createdStickerPreview, setCreatedStickerPreview] = useState<string | null>(null);
  const [createdStickerSourceName, setCreatedStickerSourceName] = useState('');
  const [isStickerLoading, setIsStickerLoading] = useState(false);

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

  React.useEffect(() => {
    if (!activeChat) {
      setShowEmojiPicker(false);
      setShowStickerPanel(false);
      setIsCreateStickerModalOpen(false);
    }
  }, [activeChat?.chatId]);

  React.useEffect(() => {
    if (isCreateStickerModalOpen && !createdStickerFile) {
      const timeoutId = window.setTimeout(() => {
        stickerFileInputRef.current?.click();
      }, 120);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isCreateStickerModalOpen, createdStickerFile]);

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

  const handleChatSelect = (chat: any) => {
    setActiveChat(chat);
    if (isMobile) setShowMobileChatList(false);
  };

  const handleDownloadFile = async (url: string, fileName?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'descarga';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Error al descargar el archivo');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      handleSendFileMessage();
      return;
    }
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Archivo demasiado grande', { description: 'El tamaño máximo es 100MB' });
      return;
    }

    setSelectedFile(file);

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          // Validar tamaño (100MB)
          if (file.size > 100 * 1024 * 1024) {
            toast.error('Archivo demasiado grande', { description: 'El tamaño máximo es 100MB' });
            return;
          }

          let finalFile = file;
          // Rename snippet/screenshot image logically
          if (file.type.startsWith('image/')) {
            const ext = file.type.split('/')[1] || 'png';
            finalFile = new File([file], `Imagen_Pegada_${new Date().getTime()}.${ext}`, { type: file.type });
          }

          setSelectedFile(finalFile);

          // Crear preview para imágenes
          if (finalFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setFilePreview(ev.target?.result as string);
            reader.readAsDataURL(finalFile);
          } else {
            setFilePreview(null);
          }

          e.preventDefault(); // Prevenir que se pegue como texto si es archivo
          break; // Tomar solo el primer archivo pegado
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInsertEmoji = (emoji: string) => {
    setNewMessage((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
  };

  const loadStickerLibrary = async () => {
    try {
      const data = await stickerService.getStickers();
      setCustomStickers(data.custom || []);
    } catch (error: any) {
      toast.error('Error al cargar stickers', { description: error.message || 'No se pudo cargar la biblioteca' });
    }
  };

  const toggleStickerPanel = async () => {
    const nextState = !showStickerPanel;
    setShowStickerPanel(nextState);
    setShowEmojiPicker(false);

    if (nextState && customStickers.length === 0) {
      await loadStickerLibrary();
    }
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sticker';

  const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar el sticker'));
          return;
        }
        resolve(blob);
      }, 'image/webp', quality);
    });

  const exportCanvasToStickerFile = async (canvas: HTMLCanvasElement, fileName: string) => {
    let quality = 0.92;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > 100 * 1024 && quality > 0.5) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size > 100 * 1024) {
      throw new Error('No se pudo generar un sticker menor a 100 KB');
    }

    return new File([blob], fileName, { type: 'image/webp' });
  };

  const createPresetStickerFile = async (preset: PresetSticker) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo crear el sticker');
    }

    ctx.fillStyle = preset.accent;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 512, 64);
    ctx.fill();

    ctx.font = '220px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(preset.emoji, 256, 210);

    ctx.fillStyle = preset.textColor;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(preset.name.toUpperCase(), 256, 390);

    return exportCanvasToStickerFile(canvas, `${slugify(preset.name)}.webp`);
  };

  const fileToImage = (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo leer la imagen'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });

  const buildStickerFromImage = async (sourceFile: File) => {
    const image = await fileToImage(sourceFile);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo preparar el sticker');
    }

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 512, 52);
    ctx.fill();

    const padding = 36;
    const drawableSize = 512 - padding * 2;
    const scale = Math.min(drawableSize / image.width, drawableSize / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (512 - drawWidth) / 2;
    const y = (512 - drawHeight) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(18, 18, 476, 476, 36);
    ctx.clip();
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    ctx.restore();

    return exportCanvasToStickerFile(canvas, `${slugify(sourceFile.name)}.webp`);
  };

  const handleStickerSourceSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const sourceFile = e.target.files?.[0];
    if (!sourceFile) return;

    setIsStickerLoading(true);
    try {
      const stickerFile = await buildStickerFromImage(sourceFile);
      setCreatedStickerSourceName(sourceFile.name);
      setCreatedStickerFile(stickerFile);
      setCreatedStickerPreview(URL.createObjectURL(stickerFile));
    } catch (error: any) {
      toast.error('Error creando sticker', { description: error.message });
      setCreatedStickerFile(null);
      setCreatedStickerPreview(null);
    } finally {
      setIsStickerLoading(false);
    }
  };

  const resetCreatedSticker = () => {
    if (createdStickerPreview) {
      URL.revokeObjectURL(createdStickerPreview);
    }
    setCreatedStickerFile(null);
    setCreatedStickerPreview(null);
    setCreatedStickerSourceName('');
    if (stickerFileInputRef.current) {
      stickerFileInputRef.current.value = '';
    }
  };

  const openCreateStickerModal = () => {
    resetCreatedSticker();
    setIsCreateStickerModalOpen(true);
  };

  const sendStickerFile = async (file: File, caption?: string) => {
    setIsSendingFile(true);
    try {
      await sendMediaMessage(file, caption);
      toast.success('Sticker enviado');
      setShowStickerPanel(false);
    } catch {
      toast.error('Error al enviar sticker');
    } finally {
      setIsSendingFile(false);
    }
  };

  const handleSendPresetSticker = async (preset: PresetSticker) => {
    try {
      const stickerFile = await createPresetStickerFile(preset);
      await sendStickerFile(stickerFile);
    } catch (error: any) {
      toast.error('Error al crear sticker', { description: error.message });
    }
  };

  const handleSendCustomSticker = async (sticker: CustomSticker) => {
    try {
      const response = await fetch(sticker.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], `${slugify(sticker.name)}.webp`, { type: 'image/webp' });
      await sendStickerFile(file);
    } catch {
      toast.error('Error al enviar sticker');
    }
  };

  const handleSaveCreatedSticker = async () => {
    if (!createdStickerFile) return;

    try {
      const savedSticker = await stickerService.createSticker(createdStickerFile);
      setCustomStickers((prev) => [savedSticker, ...prev]);
      toast.success('Sticker guardado');
    } catch (error: any) {
      toast.error('Error al guardar sticker', { description: error.message || 'No se pudo guardar' });
    }
  };

  const handleDeleteCustomSticker = async (stickerId: string) => {
    try {
      await stickerService.deleteSticker(stickerId);
      setCustomStickers((prev) => prev.filter((sticker) => sticker._id !== stickerId));
      toast.success('Sticker eliminado');
    } catch (error: any) {
      toast.error('Error al eliminar sticker', { description: error.message || 'No se pudo eliminar' });
    }
  };

  const handleSendCreatedSticker = async () => {
    if (!createdStickerFile) return;
    await sendStickerFile(createdStickerFile);
    resetCreatedSticker();
    setIsCreateStickerModalOpen(false);
  };

  const handleSendFileMessage = async () => {
    if (!selectedFile) return;
    setIsSendingFile(true);
    try {
      await sendMediaMessage(selectedFile, newMessage.trim() || undefined);
      setNewMessage('');
      handleRemoveFile();
      toast.success('Archivo enviado');
    } catch {
      toast.error('Error al enviar archivo');
    } finally {
      setIsSendingFile(false);
    }
  };

  const getMediaTypeIcon = (mediaType: string | null | undefined) => {
    switch (mediaType) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'sticker': return <StickerIcon className="w-4 h-4" />;
      case 'video': return <Film className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'document': return <FileIcon className="w-4 h-4" />;
      default: return <FileIcon className="w-4 h-4" />;
    }
  };

  const getFileTypeLabel = (file: File): string => {
    if (file.type === 'image/webp') return 'Sticker';
    if (file.type.startsWith('image/')) return 'Imagen';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    return 'Documento';
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

  // Determine which chats to display
  const displayChats = React.useMemo(() => {
    if (isSearchActive) {
      // When searching, show search results
      return searchResults;
    }
    // Otherwise show filtered chats (by tag)
    return filteredChats;
  }, [isSearchActive, searchResults, filteredChats]);

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
                onClick={() => setIsExportModalOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Exportar chats"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsTagManagerOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Configurar tags"
              >
                <Tag className="w-5 h-5" />
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

        {/* Search Bar */}
        <ChatSearchBar
          onSearch={searchChats}
          onClear={clearSearch}
          isSearching={isSearching}
        />

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

          {/* Show search status */}
          {isSearchActive && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <p className="text-sm text-blue-700">
                {isSearching ? 'Buscando...' : `${displayChats.length} resultado${displayChats.length !== 1 ? 's' : ''} encontrado${displayChats.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          )}

          {isLoading && chats.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            displayChats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => handleChatSelect(chat)}
                className={`group w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${activeChat?.chatId === chat.chatId ? 'bg-blue-50' : ''
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
                      <div className="flex items-center ml-2 flex-shrink-0 h-5">
                        <span className="text-xs text-gray-500 transition-transform duration-200 group-hover:-translate-x-1">
                          {formatChatDate(chat.lastMessageTimestamp)}
                        </span>
                        <div className="w-0 opacity-0 group-hover:w-5 group-hover:opacity-100 transition-all duration-200 flex items-center justify-end overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteChatDialog({ isOpen: true, chatId: chat.chatId });
                            }}
                            className="text-gray-400 hover:text-red-600 flex-shrink-0"
                            title="Eliminar chat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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

          {/* Show message when search has no results */}
          {isSearchActive && !isSearching && displayChats.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600">Intenta con otro término de búsqueda</p>
            </div>
          )}

          {!isLoadingMore && !hasMore && chats.length > 0 && !isSearchActive && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">Fin de las conversaciones</p>
            </div>
          )}

          {!isLoading && chats.length === 0 && !isSearchActive && (
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
                    <>
                      {canManageAdvisors && (
                        <button
                          onClick={() => setIsAssignAdvisorModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Asignar Asesor
                        </button>
                      )}

                      {/* Send Template Button */}
                      {canSendTemplates && (
                        <button
                          onClick={() => setIsSendTemplateModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquareText className="w-4 h-4" />
                          Enviar Plantilla
                        </button>
                      )}

                      {canViewConversationSummary && (
                        <button
                          onClick={() => setIsSummaryModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Resumen
                        </button>
                      )}
                    </>
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

                  {messageGroups[dateKey].map((message) => {
                    const messageId = message.id || message._id || '';
                    const mediaProxyUrl = messageId ? chatService.getMediaUrl(messageId) : '';
                    const token = localStorage.getItem('auth_token');
                    const mediaUrlWithAuth = mediaProxyUrl ? `${mediaProxyUrl}?token=${token}` : '';

                    return (
                      <div
                        key={messageId}
                        className={`flex ${message.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg relative group ${message.sender === 'user'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-500 text-white'
                            }`}
                        >
                          {/* Media Content */}
                          {message.mediaType && message.mediaUrl && (
                            <div className="mb-2">
                              {message.mediaType === 'image' && (
                                <div className="relative group">
                                  <img
                                    src={mediaUrlWithAuth}
                                    alt=""
                                    className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    style={{ maxHeight: '300px' }}
                                    onClick={() => setLightboxImage({ url: mediaUrlWithAuth, fileName: message.fileName || undefined })}
                                    loading="lazy"
                                  />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDownloadFile(mediaUrlWithAuth, message.fileName || 'imagen'); }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                    title="Descargar"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              {message.mediaType === 'sticker' && (
                                <img
                                  src={mediaUrlWithAuth}
                                  alt={message.fileName || 'Sticker'}
                                  className="w-32 h-32 object-contain"
                                  loading="lazy"
                                />
                              )}
                              {message.mediaType === 'video' && (
                                <video
                                  controls
                                  className="max-w-full rounded-lg"
                                  style={{ maxHeight: '300px' }}
                                >
                                  <source src={mediaUrlWithAuth} />
                                  Tu navegador no soporta video.
                                </video>
                              )}
                              {message.mediaType === 'audio' && (
                                <audio controls className="w-full min-w-[200px]">
                                  <source src={mediaUrlWithAuth} />
                                  Tu navegador no soporta audio.
                                </audio>
                              )}
                              {message.mediaType === 'document' && (
                                <a
                                  href={mediaUrlWithAuth}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${message.sender === 'user'
                                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                  <FileIcon className="w-5 h-5 flex-shrink-0" />
                                  <span className="truncate text-sm">{message.fileName || 'Documento'}</span>
                                  <Download className="w-4 h-4 flex-shrink-0 ml-auto" />
                                </a>
                              )}
                            </div>
                          )}
                          {/* Text Content - hide placeholders when media exists */}
                          {message.content && !message.mediaUrl && (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                          {message.content && message.mediaUrl && !['Imagen', 'imagen', 'Image', 'image', 'Audio', 'audio', 'Video', 'video', 'Documento', 'documento', 'Sticker', 'sticker'].includes(message.content.trim()) && !message.content.startsWith('📎 ') && (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                          <div className="flex items-center justify-between mt-1 gap-4">
                            <div className="flex items-center">
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteMessageDialog({ isOpen: true, messageId });
                              }}
                              className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${message.sender === 'user' ? 'text-gray-400 hover:text-red-600' : 'text-white/60 hover:text-white'
                                }`}
                              title="Eliminar mensaje"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Message Input */}
            {activeChat.chatStatus === 'human' ? (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                {/* File Preview */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-3">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        {getMediaTypeIcon(selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : selectedFile.type.startsWith('audio/') ? 'audio' : 'document')}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{getFileTypeLabel(selectedFile)} • {(selectedFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {(showEmojiPicker || showStickerPanel) && (
                  <div className="mb-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    {showEmojiPicker && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <EmojiIcon className="h-4 w-4 text-amber-500" />
                            <span>Emojis</span>
                          </div>
                        <div className="space-y-2">
                          {EMOJI_GROUPS.map((group, index) => (
                            <div key={index} className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                              {group.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleInsertEmoji(emoji)}
                                  className="rounded-xl border border-gray-200 bg-gray-50 py-2 text-lg hover:bg-gray-100 transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showStickerPanel && (
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                            <StickerIcon className="h-4 w-4 text-emerald-600" />
                            <span>Biblioteca default</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {presetStickers.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSendPresetSticker(preset)}
                                className="rounded-2xl border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors text-center"
                              >
                                <span className="block text-3xl">{preset.emoji}</span>
                                <span className="mt-1 block text-xs text-gray-700 truncate">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                            <StickerIcon className="h-4 w-4 text-sky-600" />
                            <span>Tus stickers</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {customStickers.length > 0 ? customStickers.map((sticker) => (
                              <div
                                key={sticker._id}
                                className="group relative rounded-2xl border border-gray-200 bg-gray-50 p-2 transition-colors hover:bg-gray-100"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSendCustomSticker(sticker)}
                                  className="block w-full text-center"
                                >
                                  <img src={sticker.fileUrl} alt={sticker.name} className="mx-auto h-16 w-16 object-contain" />
                                  <span className="mt-1 block text-xs text-gray-700 truncate">{sticker.name}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCustomSticker(sticker._id);
                                  }}
                                  className="absolute right-2 top-2 rounded-full border border-red-200 bg-white p-1 text-red-500 opacity-0 shadow-sm transition-opacity hover:bg-red-50 group-hover:opacity-100"
                                  title="Eliminar sticker"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )) : (
                              <div className="col-span-full rounded-xl border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                                Todavía no hay stickers guardados
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                            <StickerIcon className="h-4 w-4 text-violet-600" />
                            <span>Crear sticker</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            <button
                              type="button"
                              onClick={openCreateStickerModal}
                              className="flex min-h-[112px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-3 text-center text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                            >
                              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <ImagePlus className="h-5 w-5" />
                              </div>
                              <span className="text-sm font-medium">Crear</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker((prev) => !prev);
                      setShowStickerPanel(false);
                    }}
                    className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                    title="Emojis"
                  >
                    <EmojiIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleStickerPanel}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    title="Stickers"
                  >
                    <StickerIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Adjuntar archivo"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={selectedFile ? 'Añadir un mensaje (opcional)...' : 'Escribir mensaje...'}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || isSendingFile}
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
      {activeChat && canManageAdvisors && (
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

      {/* Chat Summary Modal */}
      {activeChat && canViewConversationSummary && (
        <ChatSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          chatId={activeChat.chatId}
          chatName={activeChat.contactName || activeChat.phoneNumber}
        />
      )}

      {/* Send Template Modal */}
      {activeChat && canSendTemplates && (
        <SendTemplateModal
          isOpen={isSendTemplateModalOpen}
          onClose={() => setIsSendTemplateModalOpen(false)}
          chatId={activeChat.chatId}
          chatName={activeChat.contactName || activeChat.phoneNumber}
          onTemplateSent={async () => {
            // Refresh chats to show updated status
            await refreshChats();
            // Update active chat status to 'human'
            if (activeChat) {
              setActiveChat({
                ...activeChat,
                chatStatus: 'human',
                statusChangeTime: new Date().toISOString()
              });
            }
          }}
        />
      )}

      {/* Export Chats Modal */}
      <ExportChatsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportComplete={() => {
          // Just close modal, no selection to clear
        }}
      />

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownloadFile(lightboxImage.url, lightboxImage.fileName || 'imagen'); }}
            className="absolute top-4 right-16 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="Descargar"
          >
            <Download className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage.url}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Confirm Delete Chat Dialog */}
      <ConfirmDialog
        isOpen={deleteChatDialog.isOpen}
        onClose={() => setDeleteChatDialog({ isOpen: false, chatId: '' })}
        onConfirm={() => {
          if (deleteChatDialog.chatId) {
            deleteChat(deleteChatDialog.chatId);
          }
        }}
        title="Eliminar Chat"
        message="¿Estás seguro de que quieres eliminar este chat y todos sus mensajes? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Confirm Delete Message Dialog */}
      <ConfirmDialog
        isOpen={deleteMessageDialog.isOpen}
        onClose={() => setDeleteMessageDialog({ isOpen: false, messageId: '' })}
        onConfirm={() => {
          if (deleteMessageDialog.messageId) {
            deleteMessage(deleteMessageDialog.messageId);
          }
        }}
        title="Eliminar Mensaje"
        message="¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
      <Dialog open={isCreateStickerModalOpen} onOpenChange={setIsCreateStickerModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickerIcon className="h-5 w-5 text-violet-600" />
              Crear sticker
            </DialogTitle>
            <DialogDescription>
              Selecciona una imagen PNG, JPG o WEBP y genera un sticker para guardar o enviar al chat.
            </DialogDescription>
          </DialogHeader>

          <input
            ref={stickerFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleStickerSourceSelect}
            className="hidden"
          />

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => stickerFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ImagePlus className="h-4 w-4" />
              <span>{createdStickerFile ? 'Cambiar foto' : 'Seleccionar foto'}</span>
            </button>

            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {createdStickerSourceName || 'Todavía no seleccionaste ninguna foto'}
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                {createdStickerPreview ? (
                  <img src={createdStickerPreview} alt="Preview sticker" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <StickerIcon className="h-6 w-6" />
                    <span className="text-[11px] text-center px-2">Preview</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveCreatedSticker}
                  disabled={!createdStickerFile || isStickerLoading}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleSendCreatedSticker}
                  disabled={!createdStickerFile || isStickerLoading || isSendingFile}
                  className="rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Enviar
                </button>
                <button
                  type="button"
                  onClick={resetCreatedSticker}
                  disabled={!createdStickerFile && !createdStickerPreview}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
