import api from './api';

export interface Inscription {
  _id: string;
  dni: string;
  nombre: string;
  email: string;
  telefono: string;
  provincia: string;
  curso: string;
  comentarios?: string;
  createdAt: string;
}

export interface InscriptionFilters {
  dni?: string;
  provincia?: string;
  curso?: string;
  page?: number;
  limit?: number;
}

export interface InscriptionResponse {
  success: boolean;
  inscriptions: Inscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateInscriptionData {
  dni: string;
  nombre: string;
  telefono: string;
  email: string;
  provincia: string;
  curso: string;
  comentarios?: string;
}

export const inscriptionService = {
  async getInscriptions(filters: InscriptionFilters = {}): Promise<InscriptionResponse> {
    const response = await api.get('/inscriptions', { params: filters });
    return response.data;
  },

  async createInscription(data: CreateInscriptionData): Promise<Inscription> {
    const response = await api.post('/inscriptions', data);
    return response.data;
  },

  async deleteInscription(inscriptionId: string): Promise<void> {
    await api.delete(`/inscriptions/${inscriptionId}`);
  }
};