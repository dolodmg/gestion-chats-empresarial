import api, { API_PUBLIC_BASE_URL } from './api';

export interface PresetSticker {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  textColor: string;
  category: string;
}

export interface CustomSticker {
  _id: string;
  name: string;
  category: string;
  fileUrl: string;
  mimeType: string;
  size: number;
}

function resolveStickerUrl(fileUrl: string): string {
  if (!fileUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  return `${API_PUBLIC_BASE_URL}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
}

function buildStickerApiUrl(stickerId: string): string {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  let clientId = '';

  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      clientId = parsed?.clientId || '';
    } catch {
      clientId = '';
    }
  }

  const params = new URLSearchParams();
  if (token) {
    params.set('token', token);
  }
  if (clientId) {
    params.set('clientId', clientId);
  }

  const query = params.toString();
  return `${API_PUBLIC_BASE_URL}/api/stickers/${stickerId}/file${query ? `?${query}` : ''}`;
}

export const stickerService = {
  async getStickers(): Promise<{ defaults: PresetSticker[]; custom: CustomSticker[] }> {
    const response = await api.get('/stickers');
    const custom = (response.data.custom || []).map((sticker: CustomSticker) => ({
      ...sticker,
      fileUrl: buildStickerApiUrl(sticker._id)
    }));

    const defaults = response.data.defaults || [];

    return { defaults, custom };
  },

  async createSticker(file: File, name?: string, category = 'custom'): Promise<CustomSticker> {
    const formData = new FormData();
    formData.append('sticker', file);
    if (name) {
      formData.append('name', name);
    }
    formData.append('category', category);

    const response = await api.post('/stickers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return {
      ...response.data.sticker,
      fileUrl: buildStickerApiUrl(response.data.sticker._id)
    };
  },

  async deleteSticker(stickerId: string): Promise<void> {
    await api.delete(`/stickers/${stickerId}`);
  }
};
