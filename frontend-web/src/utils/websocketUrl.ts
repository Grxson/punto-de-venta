export const toWebSocketEndpoint = (apiUrl: string): string => {
  return new URL('/ws', apiUrl).toString();
};
