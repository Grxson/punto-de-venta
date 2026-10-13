/**
 * Declaraciones de tipos para `sockjs-client`.
 *
 * El paquete no distribuye sus propios tipos, así que se declaran aquí los
 * mínimos que usa `websocket.service.ts`: la instancia, sus manejadores de
 * eventos y los estados de conexión.
 */
declare module 'sockjs-client' {
  /** Instancia de una conexión SockJS. */
  interface SockJS {
    /** Envía un mensaje por la conexión. */
    send(data: string): void;
    /** Cierra la conexión. */
    close(): void;
    /** Se dispara cuando la conexión se establece. */
    onopen: ((event: any) => void) | null;
    /** Se dispara por cada mensaje entrante. */
    onmessage: ((event: any) => void) | null;
    /** Se dispara al cerrarse la conexión. */
    onclose: ((event: any) => void) | null;
    /** Se dispara ante un error de transporte. */
    onerror: ((event: any) => void) | null;
    /** Estado actual de la conexión; comparar con las constantes del constructor. */
    readyState: number;
  }

  /** Constructor de SockJS, con sus estados de conexión. */
  interface SockJSConstructor {
    new (url: string, protocols?: string | string[], options?: any): SockJS;
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
  }

  const SockJS: SockJSConstructor;
  export = SockJS;
}
