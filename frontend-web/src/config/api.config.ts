/**
 * Configuración de API para diferentes ambientes
 * 
 * Desarrollo: Backend local
 * Staging: Railway staging
 * Producción: Railway production
 */

interface ApiConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
}

interface Environment {
  dev: ApiConfig;
  staging: ApiConfig;
  prod: ApiConfig;
}

// Detectar ambiente desde variables de entorno
const getEnvVars = (): ApiConfig => {
  const nodeEnv = import.meta.env.MODE || 'development';
  const apiUrlDev = import.meta.env.VITE_API_URL_DEV || 'http://localhost:8080/api';
  const apiUrlStaging = import.meta.env.VITE_API_URL_STAGING || 'https://punto-de-venta-staging.up.railway.app/api';
  const apiUrlProd = import.meta.env.VITE_API_URL_PROD || 'https://punto-de-venta-production.up.railway.app/api';

  const ENV: Environment = {
    dev: {
      apiUrl: apiUrlDev,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      retries: Number(import.meta.env.VITE_API_RETRIES) || 3,
    },
    staging: {
      apiUrl: apiUrlStaging,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      retries: Number(import.meta.env.VITE_API_RETRIES) || 3,
    },
    prod: {
      apiUrl: apiUrlProd,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      retries: Number(import.meta.env.VITE_API_RETRIES) || 3,
    },
  };

  // En desarrollo
  if (nodeEnv === 'development') {
    return ENV.dev;
  }

  // Staging explícito
  if (import.meta.env.VITE_APP_ENV === 'staging') {
    return ENV.staging;
  }

  // Producción por defecto
  return ENV.prod;
};

export const API_CONFIG = getEnvVars();

/**
 * Headers comunes para todas las peticiones
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Versión
  VERSION: '/version',
  
  // Usuarios
  USERS: '/usuarios',
  
  // Productos (endpoints están bajo /api/inventario/)
  PRODUCTS: '/inventario/productos',
  CATEGORIES: '/inventario/categorias-productos',
  
  // Ventas
  SALES: '/ventas',
  SALES_ITEMS: '/ventas/items',
  SALES_CANCELAR: '/ventas', // Base path, se usa con /{id}/cancelar
  
  // Pagos
  PAYMENTS: '/pagos',
  PAYMENT_METHODS: '/ventas/metodos-pago',
  PAYMENT_METHODS_ACTIVOS: '/ventas/metodos-pago/activos',
  
  // Estadísticas
  STATS_DAILY: '/estadisticas/ventas/dia',
  STATS_SALES_RANGE: '/estadisticas/ventas/rango',
  STATS_PRODUCTS_RANGE: '/estadisticas/productos/rango',
  
  // Inventario
  INVENTORY: '/inventario',
  PROVEEDORES: '/inventario/proveedores',
  
  // Reportes
  REPORTS: '/reportes',
  
  // Sucursales
  BRANCHES: '/sucursales',
  CASH_REGISTERS: '/cajas',
  
  // Turnos
  SHIFTS: '/turnos',
  
  // Finanzas - Gastos
  GASTOS: '/finanzas/gastos',
  CATEGORIAS_GASTO: '/finanzas/categorias-gasto',
};

export default API_CONFIG;

