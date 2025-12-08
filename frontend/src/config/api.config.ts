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

// Cargar variables desde react-native-config (si está disponible)
// Fallback a valores hardcodeados si no existen.
import Config from 'react-native-config';

const ENV: Environment = {
  dev: {
    apiUrl: Config.API_URL_DEV || 'http://localhost:8080/api',
    timeout: Number(Config.API_TIMEOUT) || 30000, // Timeout normal después de optimización del menu
    retries: Number(Config.API_RETRIES) || 3,
  },
  staging: {
    apiUrl: Config.API_URL_STAGING || 'https://punto-de-venta-staging.up.railway.app/api',
    timeout: Number(Config.API_TIMEOUT) || 30000,
    retries: Number(Config.API_RETRIES) || 3,
  },
  prod: {
    apiUrl: Config.API_URL_PROD || 'https://punto-de-venta-production.up.railway.app/api',
    timeout: Number(Config.API_TIMEOUT) || 30000,
    retries: Number(Config.API_RETRIES) || 3,
  },
};

/**
 * Obtener configuración según el ambiente
 */
const getEnvVars = (): ApiConfig => {
  // Detectar ambiente
  const nodeEnv = process.env.NODE_ENV || 'development';
  const reactAppEnv = Config.REACT_APP_ENV || process.env.REACT_APP_ENV;

  // En desarrollo
  if (nodeEnv === 'development' || __DEV__) {
    return ENV.dev;
  }

  // Staging explícito
  if (reactAppEnv === 'staging') {
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
  
  // Productos
  PRODUCTS: '/productos',
  CATEGORIES: '/categorias',
  
  // Ventas
  SALES: '/ventas',
  SALES_ITEMS: '/ventas/items',
  
  // Pagos
  PAYMENTS: '/pagos',
  PAYMENT_METHODS: '/metodos-pago',
  
  // Inventario
  INVENTORY: '/inventario',
  
  // Reportes
  REPORTS: '/reportes',
  
  // Sucursales
  BRANCHES: '/sucursales',
  CASH_REGISTERS: '/cajas',
  
  // Turnos
  SHIFTS: '/turnos',
};

export default API_CONFIG;
