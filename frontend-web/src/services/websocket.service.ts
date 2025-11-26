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

// Tipo para el mensaje STOMP (basado en lo que retorna subscribe)
interface StompMessage {
  body: string;
  headers: Record<string, string>;
  command: string;
  ack?: () => void;
  nack?: () => void;
}

// Tipo para la suscripción STOMP
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
  private handlersRegistered: Set<string> = new Set(); // Track registered handlers

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const wsUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const wsEndpoint = `${wsUrl.replace(/^https?/, 'ws')}/ws`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws`) as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.subscribeToTopics();
      },
      onDisconnect: () => {
        console.log('WebSocket desconectado');
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Máximo de intentos de reconexión alcanzado');
        }
      },
      onWebSocketError: (event) => {
        console.error('Error WebSocket:', event);
      },
    });
  }

  connect() {
    if (!this.client) {
      this.initializeClient();
    }

    if (!this.connected && this.client) {
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
    // Suscribirse a productos
    this.subscribe('/topic/productos', (message) => {
      this.handleMessage('productos', message);
    });

    // Suscribirse a ventas
    this.subscribe('/topic/ventas', (message) => {
      this.handleMessage('ventas', message);
    });

    // Suscribirse a estadísticas
    this.subscribe('/topic/estadisticas', (message) => {
      this.handleMessage('estadisticas', message);
    });

    // Suscribirse a inventario
    this.subscribe('/topic/inventario', (message) => {
      this.handleMessage('inventario', message);
    });
  }

  private subscribe(destination: string, callback: (message: StompMessage) => void) {
    if (!this.client || !this.connected) {
      console.warn('Cliente WebSocket no conectado');
      return;
    }

    const subscription = this.client.subscribe(destination, callback);
    // El método subscribe retorna un objeto con id y unsubscribe
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
      console.error('Error procesando mensaje WebSocket:', error);
    }
  }

  on(topic: string, handler: MessageHandler): () => void {
    const handlerId = `${topic}-${handler.toString().slice(0, 50)}`;
    
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    
    // Verificar si ya está registrado para evitar duplicados
    const handlersSet = this.handlers.get(topic)!;
    const alreadyRegistered = Array.from(handlersSet).some(h => h === handler);
    
    if (!alreadyRegistered) {
      handlersSet.add(handler);
    }

    // Retornar función para desuscribirse
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

// Instancia singleton
export const websocketService = new WebSocketService();

