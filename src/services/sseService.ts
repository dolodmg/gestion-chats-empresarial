// services/sseService.ts

import { API_BASE_URL } from './api';

const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug(...args);
};

type SSEEventType = 'new_message' | 'chat_status_changed' | 'chat_updated' | 'connected' | 'heartbeat';

interface SSEEvent {
  type: SSEEventType;
  data: any;
}

type SSECallback = (event: SSEEvent) => void;

class SSEService {
  private eventSource: EventSource | null = null;
  private callbacks: Set<SSECallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = true;

  /**
   * Conectar al servidor SSE
   */
  connect(token: string) {
    this.shouldReconnect = true;
    if (this.eventSource) {
      debug('SSE ya conectado, cerrando conexión anterior');
      this.disconnect();
      this.shouldReconnect = true;
    }

    const url = `${API_BASE_URL}/sse/events?token=${encodeURIComponent(token)}`;
    
    debug('Conectando a SSE...');
    this.eventSource = new EventSource(url);

    // Evento: Conectado
    this.eventSource.addEventListener('connected', (e) => {
      debug('SSE conectado:', JSON.parse(e.data));
      this.notifyCallbacks({ type: 'connected', data: JSON.parse(e.data) });
    });

    // Evento: Nuevo mensaje
    this.eventSource.addEventListener('new_message', (e) => {
      const data = JSON.parse(e.data);
      debug('Nuevo mensaje recibido:', data.chatId);
      this.notifyCallbacks({ type: 'new_message', data });
    });

    // Evento: Cambio de estado de chat
    this.eventSource.addEventListener('chat_status_changed', (e) => {
      const data = JSON.parse(e.data);
      debug('Estado de chat cambiado:', data.chatId, '->', data.chatStatus);
      this.notifyCallbacks({ type: 'chat_status_changed', data });
    });

    // Evento: Actualización de chat
    this.eventSource.addEventListener('chat_updated', (e) => {
      const data = JSON.parse(e.data);
      debug('Chat actualizado:', data.chatId);
      this.notifyCallbacks({ type: 'chat_updated', data });
    });

    // Evento: Heartbeat
    this.eventSource.addEventListener('heartbeat', () => {
      // Silencioso, solo para mantener la conexión viva
    });

    // Error handler
    this.eventSource.onerror = () => {
      console.error('❌ Error en SSE');
      
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        debug('Conexión SSE cerrada');
        
        if (this.shouldReconnect) {
          debug('Intentando reconectar en 3 segundos...');
          this.reconnectTimeout = setTimeout(() => {
            this.connect(token);
          }, 3000);
        }
      }
    };

    // Open handler
    this.eventSource.onopen = () => {
      debug('Conexión SSE establecida');
    };
  }

  /**
   * Desconectar del servidor SSE
   */
  disconnect() {
    this.shouldReconnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      debug('SSE desconectado');
    }
  }

  /**
   * Suscribirse a eventos SSE
   */
  subscribe(callback: SSECallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notificar a todos los callbacks
   */
  private notifyCallbacks(event: SSEEvent) {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error en callback SSE:', error);
      }
    });
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Singleton
export const sseService = new SSEService();
export default sseService;
