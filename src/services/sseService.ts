import { authService } from './authService';

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
  private shouldReconnect = true;

  async connect() {
    if (this.eventSource) {
      console.log('SSE ya conectado, cerrando conexion anterior');
      this.disconnect();
    }

    this.shouldReconnect = true;

    const browserToken = authService.getStoredBrowserToken() || await authService.refreshBrowserToken();
    const url = `${import.meta.env.VITE_API_URL || 'https://chat.pupuia.com'}/api/sse/events?browserToken=${encodeURIComponent(browserToken)}`;

    console.log('Conectando a SSE...');
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      this.notifyCallbacks({ type: 'connected', data });
    });

    this.eventSource.addEventListener('new_message', (e) => {
      const data = JSON.parse(e.data);
      this.notifyCallbacks({ type: 'new_message', data });
    });

    this.eventSource.addEventListener('chat_status_changed', (e) => {
      const data = JSON.parse(e.data);
      this.notifyCallbacks({ type: 'chat_status_changed', data });
    });

    this.eventSource.addEventListener('chat_updated', (e) => {
      const data = JSON.parse(e.data);
      this.notifyCallbacks({ type: 'chat_updated', data });
    });

    this.eventSource.addEventListener('heartbeat', () => {});

    this.eventSource.onerror = () => {
      console.error('Error en SSE');

      if (this.eventSource?.readyState === EventSource.CLOSED && this.shouldReconnect) {
        this.reconnectTimeout = setTimeout(() => {
          void this.connect();
        }, 3000);
      }
    };

    this.eventSource.onopen = () => {
      console.log('Conexion SSE establecida');
    };
  }

  disconnect() {
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE desconectado');
    }
  }

  subscribe(callback: SSECallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private notifyCallbacks(event: SSEEvent) {
    this.callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error en callback SSE:', error);
      }
    });
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const sseService = new SSEService();
export default sseService;
