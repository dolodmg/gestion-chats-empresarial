import api from './api';

export interface Inscription {
  _id: string;
  dni: string;
  nombreCompleto: string;
  correo: string;
  provincia: string;
  localidad: string;
  codigoPostal: string;
  curso: string;
  createdAt: string;
  updatedAt: string;
}

export interface InscriptionFilters {
  dni?: string;
  provincia?: string;
  curso?: string;
  cicloLectivo?: string;
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
  nombreCompleto: string;
  curso: string;
  correo: string;
  provincia: string;
  localidad: string;
  codigoPostal: string;
}

export const inscriptionService = {
  /**
   * Obtener inscripciones con filtros
   */
  async getInscriptions(filters: InscriptionFilters = {}): Promise<InscriptionResponse> {
    const response = await api.get('/inscriptions', { params: filters });
    return response.data;
  },

  /**
   * Crear nueva inscripción
   */
  async createInscription(data: CreateInscriptionData): Promise<{ success: boolean; message: string; inscription: Inscription }> {
    const response = await api.post('/inscriptions', data);
    return response.data;
  },

  /**
   * Eliminar inscripción
   */
  async deleteInscription(inscriptionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/inscriptions/${inscriptionId}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de inscripciones
   */
  async getStats(): Promise<any> {
    const response = await api.get('/inscriptions/stats');
    return response.data;
  },

  /**
   * Obtener lista de cursos disponibles
   */
  async getCourses(): Promise<any> {
    const response = await api.get('/inscriptions/courses');
    return response.data;
  },

  /**
   * Exportar inscripciones a CSV
   */
  async exportToCSV(filters: InscriptionFilters = {}): Promise<Blob> {
    const response = await api.get('/inscriptions/export/csv', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};