interface Tag {
  name: string;
  color: string;
  createdAt?: string;
  _id?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  tags?: T;
  tag?: Tag;
  stats?: any;
}

class TagService {
  private baseUrl: string;
  private tags: Tag[];

  constructor() {
    this.baseUrl = window.location.origin;
    this.tags = [];
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    };
  }

  async loadUserTags(): Promise<Tag[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error cargando tags');
      }

      const data: ApiResponse<Tag[]> = await response.json();
      this.tags = data.tags || [];
      return this.tags;
    } catch (error) {
      console.error('Error loading tags:', error);
      throw error;
    }
  }

  async createTag(name: string, color: string = '#3B82F6'): Promise<Tag> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name, color })
      });

      if (!response.ok) {
        const error: ApiResponse<never> = await response.json();
        throw new Error(error.error || 'Error creando tag');
      }

      const data: ApiResponse<never> = await response.json();
      if (data.tag) {
        this.tags.push(data.tag);
      }
      return data.tag!;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  async updateTagColor(tagName: string, color: string): Promise<Tag> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tags/${encodeURIComponent(tagName)}/color`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ color })
        }
      );

      if (!response.ok) {
        throw new Error('Error actualizando color');
      }

      const data: ApiResponse<never> = await response.json();

      const tagIndex = this.tags.findIndex(t => t.name === tagName);
      if (tagIndex !== -1) {
        this.tags[tagIndex].color = color;
      }

      return data.tag!;
    } catch (error) {
      console.error('Error updating tag color:', error);
      throw error;
    }
  }

  async deleteTag(tagName: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tags/${encodeURIComponent(tagName)}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Error eliminando tag');
      }

      this.tags = this.tags.filter(t => t.name !== tagName);
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  async addTagToChat(chatId: string, tagName: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tags/chats/${chatId}/tags`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ tag: tagName })
        }
      );

      if (!response.ok) {
        const error: ApiResponse<never> = await response.json();
        throw new Error(error.error || 'Error agregando tag');
      }

      const data: ApiResponse<string[]> = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Error adding tag to chat:', error);
      throw error;
    }
  }

  async removeTagFromChat(chatId: string, tagName: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tags/chats/${chatId}/tags/${encodeURIComponent(tagName)}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Error removiendo tag');
      }

      const data: ApiResponse<string[]> = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Error removing tag from chat:', error);
      throw error;
    }
  }

  async updateChatTags(chatId: string, tags: string[]): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tags/chats/${chatId}/tags`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ tags })
        }
      );

      if (!response.ok) {
        throw new Error('Error actualizando tags');
      }

      const data: ApiResponse<string[]> = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Error updating chat tags:', error);
      throw error;
    }
  }

  async getTagStats(): Promise<Array<{ _id: string; count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags/stats`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo estadísticas');
      }

      const data: ApiResponse<never> = await response.json();
      return data.stats || [];
    } catch (error) {
      console.error('Error getting tag stats:', error);
      throw error;
    }
  }

  getTag(tagName: string): Tag | undefined {
    return this.tags.find(t => t.name === tagName.toLowerCase());
  }

  getAllTags(): Tag[] {
    return this.tags;
  }

  clearCache(): void {
    this.tags = [];
  }
}

export const tagService = new TagService();

export default TagService;

export type { Tag, ApiResponse };