import { setupServer } from 'msw/node';
import { handlers } from './handlers/index.ts';

/**
 * Servidor de MSW para los tests de Node.
 *
 * Reutiliza exactamente los mismos handlers que el navegador, de modo que las
 * pruebas validan los contratos que verá el desarrollador en `dev:mock`.
 */
export const server = setupServer(...handlers);
