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

const ENV: Environment = {
  dev: {
    apiUrl: 'http://localhost:8080/api',
    timeout: 30000,
    retries: 3,
  },
  staging: {
    apiUrl: 'https://punto-de-venta-production-d424.up.railway.app/api', // Cambiar después del deploy
    timeout: 30000,
    retries: 3,
  },
  prod: {
    apiUrl: 'https://punto-de-venta-production-d424.up.railway.app/api', // Cambiar después del deploy
    timeout: 30000,
    retries: 3,
  },
};

/**
 * Obtener configuración según el ambiente
 */
const getEnvVars = (): ApiConfig => {
  // Detectar ambiente
  const nodeEnv = process.env.NODE_ENV || 'development';
  const reactAppEnv = process.env.REACT_APP_ENV;

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
