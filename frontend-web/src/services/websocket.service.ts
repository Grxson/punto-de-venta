/**
 * Servicio de comunicación en tiempo real.
 *
 * Envuelve STOMP sobre SockJS para recibir avisos de cambios en productos,
 * ventas, estadísticas e inventario, y los reenvía a los suscriptores por
 * topic. La reconexión es responsabilidad del cliente STOMP (5 s entre
 * intentos, con tope de aviso a los 5 reintentos).
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_CONFIG } from '../config/api.config';
import { toWebSocketEndpoint } from '../utils/websocketUrl';
import { MOCKS_ENABLED } from '../mocks/config.ts';

/** Mensaje normalizado que entrega la API por WebSocket. */
export interface WebSocketMessage {
  /** Discriminante del evento, p. ej. `VENTA_CREADA`. */
  tipo: string;
  entidad: string;
  entidadId: number | null;
  datos: any;
  /** Marca de tiempo ISO del evento en el backend. */
  timestamp: string;
}

/** Función que atiende un mensaje de un topic concreto. */
type MessageHandler = (message: WebSocketMessage) => void;

/** Envoltura mínima del frame STOMP que llega por la suscripción. */
interface StompMessage {
  body: string;
  headers: Record<string, string>;
  command: string;
  ack?: () => void;
  nack?: () => void;
}

/** Suscripción viva a un destino STOMP. */
type StompSubscription = {
  id: string;
  unsubscribe: () => void;
};

class WebSocketService {
  private client: Client | null = null;
  /** Suscripciones activas por destino, para poder cerrarlas al desconectar. */
  private subscriptions: Map<string, StompSubscription> = new Map();
  /** Suscriptores por topic; un `Set` evita registrar dos veces el mismo manejador. */
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    // En modo mock no hay backend: se evita abrir SockJS (fallaría y
    // reintentaría) mientras la interfaz trabaja contra MSW.
    if (MOCKS_ENABLED) {
      return;
    }
    this.initializeClient();
  }

  /**
   * Crea el cliente STOMP con su fábrica de sockets y sus callbacks de ciclo
   * de vida. Se construye de nuevo si la instancia anterior se perdió.
   */
  private initializeClient() {
    // El endpoint se deriva de API_CONFIG en RUNTIME (no en build) por el mismo
    // motivo que api.config: Railway inyecta las variables tras compilar.
    const wsEndpoint = toWebSocketEndpoint(API_CONFIG.apiUrl);


    this.client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint) as any,
      reconnectDelay: 5000,
      // Heartbeat por debajo del timeout por defecto del broker: detecta
      // conexiones muertas que el TCP aún no ha cerrado.
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        // Las suscripciones se rehacen en cada reconexión: el broker las
        // descarta al cerrarse la conexión.
        this.subscribeToTopics();
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onStompError: (frame) => {
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('🔌 WebSocket: máximo de intentos de reconexión alcanzado.');
        }
      },
      onWebSocketError: (event) => {
      },
    });
  }

  /**
   * Abre la conexión si no lo está ya.
   * Es idempotente: llamarlo con la conexión activa no hace nada.
   */
  connect() {
    if (MOCKS_ENABLED) {
      return;
    }

    if (!this.client) {
      this.initializeClient();
    }

    if (!this.connected && this.client) {
      this.client.activate();
    }
  }

  /**
   * Cierra la conexión y cancela todas las suscripciones.
   */
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

  /**
   * Suscribe a los topics de la aplicación. Se invoca en cada conexión
   * correcta, no una sola vez.
   */
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

  /**
   * Registra un manejador para un topic.
   *
   * @param topic - Nombre del topic a escuchar.
   * @param handler - Callback que recibe cada mensaje del topic.
   * @returns Función para cancelar la suscripción de ese manejador.
   */
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

  /**
   * Quita un manejador registrado previamente.
   *
   * @param topic - Nombre del topic.
   * @param handler - Callback a eliminar.
   */
  off(topic: string, handler: MessageHandler) {
    const handlers = this.handlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Indica si el socket está conectado.
   *
   * @returns `true` si hay conexión activa.
   */
  isConnected(): boolean {
    return this.connected;
  }
}

export const websocketService = new WebSocketService();
