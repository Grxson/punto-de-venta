/**
 * Configuración de API para diferentes ambientes
 * Nota: Se lee en RUNTIME para permitir env vars inyectadas por Railway
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

// Detectar ambiente desde variables de entorno (RUNTIME)
const getEnvVars = (): ApiConfig => {
  const nodeEnv = import.meta.env.MODE || 'development';
  
  // Leer de window.__ENV__ si está disponible (inyectado por servidor)
  const windowEnv = (window as any).__ENV__ || {};
  
  // Combinar: window.__ENV__ > import.meta.env > fallbacks
  const apiUrlDev = windowEnv.VITE_API_URL_DEV || 
                    import.meta.env.VITE_API_URL_DEV || 
                    'http://localhost:8080/api';
                    
  const apiUrlStaging = windowEnv.VITE_API_URL_STAGING || 
                        import.meta.env.VITE_API_URL_STAGING || 
                        'https://backend-production-df01.up.railway.app/api';
                        
  const apiUrlProd = windowEnv.VITE_API_URL_PROD || 
                     import.meta.env.VITE_API_URL_PROD || 
                     'https://backend-production-df01.up.railway.app/api';

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

  console.log('🔧 API Config Env:', { nodeEnv, windowEnv, fallback: apiUrlProd });

  // En desarrollo
  if (nodeEnv === 'development') {
    return ENV.dev;
  }

  // Staging explícito
  if (windowEnv.VITE_APP_ENV === 'staging' || import.meta.env.VITE_APP_ENV === 'staging') {
    return ENV.staging;
  }

  // Producción por defecto
  return ENV.prod;
};

export const API_CONFIG = getEnvVars();

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Endpoints de API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  // Agregar más endpoints según sea necesario
};
