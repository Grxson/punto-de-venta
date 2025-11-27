declare module 'sockjs-client' {
  interface SockJS {
    send(data: string): void;
    close(): void;
    onopen: ((event: any) => void) | null;
    onmessage: ((event: any) => void) | null;
    onclose: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    readyState: number;
  }

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
