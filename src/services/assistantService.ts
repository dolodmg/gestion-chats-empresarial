import api from './api';

export interface AssistantPrompt {
  success: boolean;
  promptText: string;
  lastUpdated: string;
}

export const assistantService = {
  async getPrompt(): Promise<AssistantPrompt> {
    const response = await api.get('/assistant/prompt');
    return response.data;
  },

  async updatePrompt(promptText: string): Promise<void> {
    await api.put('/assistant/prompt', { promptText });
  }
};