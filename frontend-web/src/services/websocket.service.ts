import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketMessage {
  tipo: string;
  entidad: string;
  entidadId: number | null;
  datos: any;
  timestamp: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

interface StompMessage {
  body: string;
  headers: Record<string, string>;
  command: string;
  ack?: () => void;
  nack?: () => void;
}

type StompSubscription = {
  id: string;
  unsubscribe: () => void;
};

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    // Leer env vars en RUNTIME (después del build)
    const windowEnv = (window as any).__ENV__ || {};
    
    const apiUrl = windowEnv.VITE_API_URL_PROD || 
                   import.meta.env.VITE_API_URL_PROD || 
                   'https://backend-production-df01.up.railway.app';
    
    const wsEndpoint = new URL('/ws', apiUrl).toString();

    console.log('🔌 WebSocket endpoint:', wsEndpoint);

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint) as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('✅ WebSocket conectado');
        this.subscribeToTopics();
      },
      onDisconnect: () => {
        console.log('❌ WebSocket desconectado');
        this.connected = false;
      },
      onStompError: (frame) => {
        console.debug('⚠️ Error STOMP:', frame?.body);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('🔌 WebSocket: máximo de intentos de reconexión alcanzado.');
        }
      },
      onWebSocketError: (event) => {
        console.debug('⚠️ Error WebSocket (reconectando):', event);
      },
    });
  }

  connect() {
    if (!this.client) {
      this.initializeClient();
    }

    if (!this.connected && this.client) {
      console.log('🔌 Activando WebSocket client...');
      this.client.activate();
    }
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }

  private subscribeToTopics() {
    this.subscribe('/topic/productos', (message) => {
      this.handleMessage('productos', message);
    });

    this.subscribe('/topic/ventas', (message) => {
      this.handleMessage('ventas', message);
    });

    this.subscribe('/topic/estadisticas', (message) => {
      this.handleMessage('estadisticas', message);
    });

    this.subscribe('/topic/inventario', (message) => {
      this.handleMessage('inventario', message);
    });
  }

  private subscribe(destination: string, callback: (message: StompMessage) => void) {
    if (!this.client || !this.connected) {
      console.warn('⚠️ Cliente WebSocket no conectado');
      return;
    }

    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.set(destination, {
      id: subscription.id,
      unsubscribe: () => subscription.unsubscribe(),
    });
  }

  private handleMessage(topic: string, message: StompMessage) {
    try {
      const data: WebSocketMessage = JSON.parse(message.body);
      
      const handlers = this.handlers.get(topic);
      if (handlers && handlers.size > 0) {
        handlers.forEach((handler) => {
          handler(data);
        });
      }
    } catch (error) {
      console.error('❌ Error procesando mensaje WebSocket:', error);
    }
  }

  on(topic: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    
    const handlersSet = this.handlers.get(topic)!;
    const alreadyRegistered = Array.from(handlersSet).some(h => h === handler);
    
    if (!alreadyRegistered) {
      handlersSet.add(handler);
    }

    return () => {
      const handlers = this.handlers.get(topic);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  off(topic: string, handler: MessageHandler) {
    const handlers = this.handlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const websocketService = new WebSocketService();
