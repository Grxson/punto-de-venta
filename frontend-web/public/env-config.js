// Runtime environment configuration
// This script is loaded BEFORE the React app to inject environment variables
// into window.__ENV__ so they can be read at runtime

(function() {
  // Detectar ambiente actual
  const currentHost = window.location.hostname;
  const isProduction = !currentHost.includes('localhost') && !currentHost.includes('127.0.0.1');
  
  let apiUrl = 'http://localhost:8080/api';
  let apiUrlProd = 'https://backend-production-df01.up.railway.app/api';
  
  // Si está en frontend-web-production-*.up.railway.app, usar backend-production-*
  if (currentHost.includes('frontend-web-production')) {
    apiUrl = 'https://backend-production-df01.up.railway.app/api';
  }
  
  // Inyectar en window.__ENV__
  window.__ENV__ = window.__ENV__ || {};
  window.__ENV__.VITE_API_URL_DEV = apiUrl;
  window.__ENV__.VITE_API_URL_STAGING = 'https://backend-production-df01.up.railway.app/api';
  window.__ENV__.VITE_API_URL_PROD = isProduction ? apiUrlProd : apiUrl;
  window.__ENV__.VITE_API_TIMEOUT = 30000;
  window.__ENV__.VITE_API_RETRIES = 3;
  window.__ENV__.VITE_APP_ENV = isProduction ? 'production' : 'development';
  
  console.log('⚙️ Runtime Environment Config Loaded:', window.__ENV__);
})();
