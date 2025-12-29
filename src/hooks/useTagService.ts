import api from '@/services/api';
import { useState, useCallback } from 'react';

interface Tag {
  name: string;
  color: string;
  createdAt?: string;
  _id?: string;
}

interface UseTagServiceReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  loadUserTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag>;
  updateTagColor: (tagName: string, color: string) => Promise<void>;
  deleteTag: (tagName: string) => Promise<void>;
  addTagToChat: (chatId: string, tagName: string) => Promise<string[]>;
  removeTagFromChat: (chatId: string, tagName: string) => Promise<string[]>;
  updateChatTags: (chatId: string, tags: string[]) => Promise<string[]>;
  getTag: (tagName: string) => Tag | undefined;
}

export const useTagService = (): UseTagServiceReturn => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tags');
      setTags(response.data.tags || []);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error cargando tags';
      setError(message);
      console.error('Error loading tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (name: string, color: string = '#3B82F6'): Promise<Tag> => {
    try {
      console.log('🔵 Creando tag:', { name, color });

      const response = await api.post('/tags', { name, color });

      console.log('✅ Respuesta:', response.data);

      if (!response.data.tag) {
        throw new Error('Respuesta inválida del servidor');
      }

      const newTag = response.data.tag;
      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (err: any) {
      console.error('❌ Error:', err);
      const message = err.response?.data?.error || err.response?.data?.msg || err.message || 'Error creando tag';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateTagColor = useCallback(async (tagName: string, color: string) => {
    try {
      await api.put(`/tags/${encodeURIComponent(tagName)}/color`, { color });
      setTags(prev => prev.map(tag =>
        tag.name === tagName ? { ...tag, color } : tag
      ));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error actualizando color';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteTag = useCallback(async (tagName: string) => {
    try {
      await api.delete(`/tags/${encodeURIComponent(tagName)}`);
      setTags(prev => prev.filter(tag => tag.name !== tagName));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error eliminando tag';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const addTagToChat = useCallback(async (chatId: string, tagName: string): Promise<any> => {
    try {
      const response = await api.post(`/tags/chats/${chatId}/tags`, { tag: tagName });
      return response.data; // Return full response including metaEvent
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error agregando tag';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const removeTagFromChat = useCallback(async (chatId: string, tagName: string): Promise<string[]> => {
    try {
      const response = await api.delete(`/tags/chats/${chatId}/tags/${encodeURIComponent(tagName)}`);
      return response.data.tags;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error removiendo tag';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateChatTags = useCallback(async (chatId: string, tags: string[]): Promise<string[]> => {
    try {
      const response = await api.put(`/tags/chats/${chatId}/tags`, { tags });
      return response.data.tags;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error actualizando tags';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const getTag = useCallback((tagName: string): Tag | undefined => {
    return tags.find(t => t.name === tagName.toLowerCase());
  }, [tags]);

  return {
    tags,
    loading,
    error,
    loadUserTags,
    createTag,
    updateTagColor,
    deleteTag,
    addTagToChat,
    removeTagFromChat,
    updateChatTags,
    getTag
  };
};