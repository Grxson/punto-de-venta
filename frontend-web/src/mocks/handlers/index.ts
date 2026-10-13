import { authHandlers } from './auth.handlers.ts';
import { sucursalesHandlers } from './sucursales.handlers.ts';

/**
 * Conjunto de handlers HTTP del modo mock.
 *
 * Solo se declaran dominios con contrato verificable en el backend
 * (`/api/auth/*` y `/api/sucursales`). Cualquier ruta no listada aquí queda sin
 * interceptar y MSW la reporta durante el desarrollo.
 */
export const handlers = [...authHandlers, ...sucursalesHandlers];
