import api from './api';

export interface ExportChatsRequest {
    startDate?: string;
    endDate?: string;
    format: 'json' | 'csv';
}

class ChatExportService {
    /**
     * Exportar chats por rango de fechas
     */
    async exportChats(startDate?: string, endDate?: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
        const response = await api.post('/chats/export', {
            startDate,
            endDate,
            format
        }, {
            responseType: 'blob'
        });

        return response.data;
    }

    /**
     * Descargar archivo
     */
    downloadFile(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Exportar y descargar chats por rango de fechas
     */
    async exportAndDownload(startDate?: string, endDate?: string, format: 'json' | 'csv' = 'json'): Promise<void> {
        const blob = await this.exportChats(startDate, endDate, format);
        const extension = format === 'json' ? 'json' : 'csv';
        const filename = `chats-export-${Date.now()}.${extension}`;
        this.downloadFile(blob, filename);
    }
}

export const chatExportService = new ChatExportService();
