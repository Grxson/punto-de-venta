/**
 * Deriva el endpoint WebSocket a partir de la URL base de la API.
 *
 * Se construye con `URL` en lugar de concatenar cadenas para que el
 * protocolo se convierta solo: `http` pasa a `ws` y `https` a `wss`. Sin
 * esto, un frontend servido por HTTPS intenta abrir un socket inseguro y el
 * navegador lo bloquea ("insecure SockJS connection from HTTPS page").
 *
 * @param apiUrl - URL base de la API, normalmente `API_CONFIG.apiUrl`.
 * @returns URL absoluta del endpoint WebSocket (`.../ws`).
 */
export const toWebSocketEndpoint = (apiUrl: string): string => {
  return new URL('/ws', apiUrl).toString();
};
