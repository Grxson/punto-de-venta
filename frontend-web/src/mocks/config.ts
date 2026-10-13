/**
 * Configuración del modo mock (MSW).
 *
 * El frontend puede arrancar de dos formas:
 * - `dev:mock`: Vite con `--mode mock` y `VITE_ENABLE_MOCKS=true`. Las
 *   peticiones HTTP se interceptan en el Service Worker.
 * - `dev:api` / `dev`: Vite en modo desarrollo normal. Las peticiones van al
 *   backend real definido en `api.config.ts`.
 *
 * Los componentes React nunca leen este módulo: el conmutador vive en la capa
 * de infraestructura (bootstrap de `main.tsx` + `api.config.ts`).
 *
 * La doble condición es deliberada: aunque alguien exportara
 * `VITE_ENABLE_MOCKS=true` a un build de producción, `MODE` nunca valdría
 * `'mock'` en ese build y los mocks permanecerían desactivados.
 */
export const MOCKS_ENABLED =
  import.meta.env.MODE === 'mock' && import.meta.env.VITE_ENABLE_MOCKS === 'true';

/**
 * URL base que usa la aplicación bajo el modo mock.
 *
 * Es una ruta relativa al propio servidor de Vite: así ninguna petición puede
 * salir al backend real por accidente, y MSW la intercepta en el mismo origen.
 */
export const MOCK_API_BASE_URL = '/api';
