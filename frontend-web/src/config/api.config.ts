/**
 * Configuración de la API para los distintos ambientes de despliegue.
 *
 * ⚠️ Se resuelve en RUNTIME (al cargar el módulo), no en tiempo de build, y
 * esto es deliberado: Vite sustituye `import.meta.env.*` de forma estática
 * durante `npm run build:prod`, pero Railway inyecta las variables de entorno
 * DESPUÉS del build (al arrancar el contenedor). Si solo leyéramos
 * `import.meta.env`, el bundle publicado quedaría con la URL de quien hizo el
 * build. Por eso la app prioriza `window.__ENV__`, que inyecta
 * `public/env-config.js` en tiempo de ejecución.
 */

/**
 * Valores de conexión efectivos para un ambiente concreto.
 */
interface ApiConfig {
  /** URL base contra la que se resuelven todos los endpoints (ya incluye `/api`). */
  apiUrl: string;
  /** Milisegundos máximos por petición antes de abortar vía `AbortController`. */
  timeout: number;
  /** Máximo de reintentos ante errores de red (no ante errores HTTP). */
  retries: number;
}

/**
 * Configuración declarada para cada ambiente soportado.
 * Solo una de las tres termina activa; ver `getEnvVars()`.
 */
interface Environment {
  dev: ApiConfig;
  staging: ApiConfig;
  prod: ApiConfig;
}

/**
 * Resuelve la configuración de API activa leyendo las variables de entorno.
 *
 * Cadena de resolución por variable (gana la primera definida):
 *   1. `window.__ENV__` — inyectado en runtime por `public/env-config.js`
 *      desde el hostname o las variables reales del contenedor de Railway.
 *   2. `import.meta.env` — valor congelado por Vite en tiempo de build.
 *   3. Fallback literal — permite que la app funcione sin configurar nada
 *      (desarrollo local sin `.env`).
 *
 * @returns La configuración correspondiente al ambiente detectado.
 */
const getEnvVars = (): ApiConfig => {
  const nodeEnv = import.meta.env.MODE || 'development';

  // `window.__ENV__` solo existe si `public/env-config.js` corrió antes que el
  // bundle; por eso se trata como objeto potencialmente vacío.
  const windowEnv = (window as any).__ENV__ || {};

  // Cada variable aplica window.__ENV__ > import.meta.env > fallback.
  const apiUrlDev = windowEnv.VITE_API_URL_DEV || 
                    import.meta.env.VITE_API_URL_DEV || 
                    'http://localhost:8080/api';
                    
  const apiUrlStaging = windowEnv.VITE_API_URL_STAGING || 
                        import.meta.env.VITE_API_URL_STAGING || 
                        'https://backend-production-4bc3.up.railway.app/api';
                        
  const apiUrlProd = windowEnv.VITE_API_URL_PROD || 
                     import.meta.env.VITE_API_URL_PROD || 
                     'https://backend-production-4bc3.up.railway.app/api';

  const ENV: Environment = {
    dev: {
      apiUrl: apiUrlDev,
      timeout: Number(windowEnv.VITE_API_TIMEOUT || import.meta.env.VITE_API_TIMEOUT) || 30000,
      retries: Number(windowEnv.VITE_API_RETRIES || import.meta.env.VITE_API_RETRIES) || 3,
    },
    staging: {
      apiUrl: apiUrlStaging,
      timeout: Number(windowEnv.VITE_API_TIMEOUT || import.meta.env.VITE_API_TIMEOUT) || 30000,
      retries: Number(windowEnv.VITE_API_RETRIES || import.meta.env.VITE_API_RETRIES) || 3,
    },
    prod: {
      apiUrl: apiUrlProd,
      timeout: Number(windowEnv.VITE_API_TIMEOUT || import.meta.env.VITE_API_TIMEOUT) || 30000,
      retries: Number(windowEnv.VITE_API_RETRIES || import.meta.env.VITE_API_RETRIES) || 3,
    },
  };


  // En desarrollo manda el modo de build de Vite.
  if (nodeEnv === 'development') {
    return ENV.dev;
  }

  // Staging solo si se pide explícitamente; `VITE_APP_ENV` no tiene valor por
  // defecto porque un despliegue mal etiquetado cairía en producción.
  if (windowEnv.VITE_APP_ENV === 'staging' || import.meta.env.VITE_APP_ENV === 'staging') {
    return ENV.staging;
  }

  // Producción por defecto
  return ENV.prod;
};

/**
 * Configuración efectiva de la API, resuelta una única vez al cargar el módulo.
 * Todos los servicios consumen esta misma instancia.
 */
export const API_CONFIG = getEnvVars();

/** Headers que se aplican a toda petición; `buildHeaders()` los puede sobrescribir. */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Rutas de la API agrupadas por dominio funcional.
 *
 * Son rutas relativas: `api.service` las concatena a `API_CONFIG.apiUrl`, así
 * que cambiar de backend no obliga a tocar los servicios.
 */
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  VERSION: '/version',
  USERS: '/auth/usuarios',
  PRODUCTS: '/inventario/productos',
  CATEGORIES: '/inventario/categorias-productos',
  SUBCATEGORIES: '/categorias',
  SALES: '/ventas',
  SALES_ITEMS: '/ventas/items',
  SALES_CANCELAR: '/ventas',
  PAYMENTS: '/pagos',
  PAYMENT_METHODS: '/ventas/metodos-pago',
  PAYMENT_METHODS_ACTIVOS: '/ventas/metodos-pago/activos',
  MENU_ORDENADO: '/v1/menu/ordenado',
  MENU_TOP: '/v1/menu/top',
  MENU_POR_CATEGORIA: '/v1/menu/por-categoria',
  MENU_GRILLA: '/v1/menu/grilla',
  STATS_DAILY: '/estadisticas/ventas/dia',
  STATS_SALES_RANGE: '/estadisticas/ventas/rango',
  STATS_PRODUCTS_DAY: '/estadisticas/productos/dia',
  STATS_PRODUCTS_RANGE: '/estadisticas/productos/rango',
  INVENTORY: '/inventario',
  PROVEEDORES: '/inventario/proveedores',
  REPORTS: '/reportes',
  BRANCHES: '/sucursales',
  CASH_REGISTERS: '/cajas',
  SHIFTS: '/turnos',
  GASTOS: '/finanzas/gastos',
  CATEGORIAS_GASTO: '/finanzas/categorias-gasto',
};
