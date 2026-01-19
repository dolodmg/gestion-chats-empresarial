import api from './api';

export interface WhatsAppTemplate {
    _id: string;
    clientId: string;
    wabaId: string;
    templateId?: string;
    name: string;
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    language: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED' | 'DELETED';
    components: TemplateComponent[];
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateComponent {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    example?: any;
    buttons?: TemplateButton[];
}

export interface TemplateButton {
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
}

export interface CreateTemplateData {
    name: string;
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    language: string;
    components: TemplateComponent[];
}

export interface SendTemplateData {
    chatId: string;
    parameters?: string[];
}

class TemplateService {
    /**
     * Crear una nueva plantilla
     */
    async createTemplate(templateData: CreateTemplateData): Promise<WhatsAppTemplate> {
        const response = await api.post('/templates', templateData);
        return response.data.template;
    }

    /**
     * Obtener todas las plantillas
     */
    async getTemplates(filters?: {
        status?: string;
        category?: string;
        language?: string;
    }): Promise<WhatsAppTemplate[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.language) params.append('language', filters.language);

        const queryString = params.toString();
        const url = queryString ? `/templates?${queryString}` : '/templates';

        const response = await api.get(url);
        return response.data.templates;
    }

    /**
     * Obtener una plantilla por ID
     */
    async getTemplateById(id: string): Promise<WhatsAppTemplate> {
        const response = await api.get(`/templates/${id}`);
        return response.data;
    }

    /**
     * Eliminar una plantilla
     */
    async deleteTemplate(id: string): Promise<void> {
        await api.delete(`/templates/${id}`);
    }

    /**
     * Sincronizar plantillas con Facebook API
     */
    async syncTemplates(): Promise<{
        syncedCount: number;
        createdCount: number;
        totalFacebookTemplates: number;
    }> {
        const response = await api.post('/templates/sync');
        return response.data;
    }

    /**
     * Enviar plantilla a un chat
     */
    async sendTemplateToChat(
        templateId: string,
        sendData: SendTemplateData
    ): Promise<any> {
        const response = await api.post(`/templates/${templateId}/send`, sendData);
        return response.data;
    }

    /**
     * Obtener preview de una plantilla
     */
    getTemplatePreview(template: WhatsAppTemplate): string {
        const bodyComponent = template.components.find(c => c.type === 'BODY');
        return bodyComponent?.text || '';
    }

    /**
     * Verificar si una plantilla puede ser enviada
     */
    canBeSent(template: WhatsAppTemplate): boolean {
        return template.status === 'APPROVED';
    }

    /**
     * Obtener color del badge según el estado
     */
    getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            APPROVED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            PAUSED: 'bg-gray-100 text-gray-700',
            DISABLED: 'bg-gray-100 text-gray-700',
            DELETED: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    }

    /**
     * Obtener texto en español del estado
     */
    getStatusText(status: string): string {
        const texts: Record<string, string> = {
            PENDING: 'Pendiente',
            APPROVED: 'Aprobada',
            REJECTED: 'Rechazada',
            PAUSED: 'Pausada',
            DISABLED: 'Deshabilitada',
            DELETED: 'Eliminada'
        };
        return texts[status] || status;
    }

    /**
     * Obtener texto en español de la categoría
     */
    getCategoryText(category: string): string {
        const texts: Record<string, string> = {
            MARKETING: 'Marketing',
            UTILITY: 'Utilidad',
            AUTHENTICATION: 'Autenticación'
        };
        return texts[category] || category;
    }
}

export const templateService = new TemplateService();
