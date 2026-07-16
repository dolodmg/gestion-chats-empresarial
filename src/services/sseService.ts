import { authService } from './authService';
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
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  async connect() {
    this.shouldReconnect = true;

    if (this.eventSource) {
      debug('SSE already connected, closing previous connection');
      this.disconnect();
      this.shouldReconnect = true;
    }

    const browserToken = authService.getStoredBrowserToken()
      || await authService.refreshBrowserToken();
    const url = `${API_BASE_URL}/sse/events?browserToken=${encodeURIComponent(browserToken)}`;

    debug('Connecting to SSE');
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      debug('SSE connected', data);
      this.notifyCallbacks({ type: 'connected', data });
    });

    this.eventSource.addEventListener('new_message', (event) => {
      const data = JSON.parse(event.data);
      debug('New SSE message', data.chatId);
      this.notifyCallbacks({ type: 'new_message', data });
    });

    this.eventSource.addEventListener('chat_status_changed', (event) => {
      const data = JSON.parse(event.data);
      debug('SSE chat status changed', data.chatId, data.chatStatus);
      this.notifyCallbacks({ type: 'chat_status_changed', data });
    });

    this.eventSource.addEventListener('chat_updated', (event) => {
      const data = JSON.parse(event.data);
      debug('SSE chat updated', data.chatId);
      this.notifyCallbacks({ type: 'chat_updated', data });
    });

    this.eventSource.addEventListener('heartbeat', () => {});

    this.eventSource.onerror = () => {
      console.error('SSE connection error');

      if (this.eventSource?.readyState === EventSource.CLOSED && this.shouldReconnect) {
        this.reconnectTimeout = setTimeout(() => {
          void this.connect();
        }, 3000);
      }
    };

    this.eventSource.onopen = () => {
      debug('SSE connection established');
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
      debug('SSE disconnected');
    }
  }

  subscribe(callback: SSECallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private notifyCallbacks(event: SSEEvent) {
    this.callbacks.forEach((callback) => callback(event));
  }

  isConnected() {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const sseService = new SSEService();
export default sseService;
