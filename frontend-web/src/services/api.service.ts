/**
 * Servicio centralizado para peticiones HTTP
 * Maneja autenticación, errores y reintentos
 */

import { API_CONFIG, DEFAULT_HEADERS, API_ENDPOINTS } from '../config/api.config';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  requiresAuth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor() {
    this.baseUrl = API_CONFIG.apiUrl;
    this.timeout = API_CONFIG.timeout;
    this.retries = API_CONFIG.retries;
  }

  /**
   * Obtener token de autenticación desde localStorage
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Guardar token de autenticación
   */
  setAuthToken(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  /**
   * Eliminar token de autenticación
   */
  clearAuthToken(): void {
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  /**
   * Construir headers de la petición
   */
  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = { ...DEFAULT_HEADERS, ...options.headers };

    // Agregar token si se requiere autenticación
    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Realizar petición HTTP con timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  /**
   * Realizar petición con reintentos
   */
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestOptions,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options.timeout || this.timeout;

    try {
      const headers = this.buildHeaders(options);
      const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers,
      };

      // Agregar body si existe
      if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
        console.log(`📤 [${options.method}] ${url}`, options.body);
      }

      const response = await this.fetchWithTimeout(url, requestOptions, timeout);

      // Parsear respuesta
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Verificar si fue exitosa
      if (!response.ok) {
        // Si es 401, el token expiró
        if (response.status === 401) {
          this.clearAuthToken();
          // Redirigir a login si estamos en el navegador
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        return {
          success: false,
          error: data.message || data.error || 'Error en la petición',
          statusCode: response.status,
          data,
        };
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error: any) {
      // Si es error de red y hay reintentos disponibles
      if (attempt < this.retries && error.name === 'AbortError') {
        console.log(`Reintento ${attempt}/${this.retries} para ${endpoint}`);
        await this.delay(1000 * attempt); // Backoff exponencial
        return this.requestWithRetry<T>(endpoint, options, attempt + 1);
      }

      return {
        success: false,
        error: error.message || 'Error de conexión',
        statusCode: 0,
      };
    }
  }

  /**
   * Delay helper para reintentos
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Métodos públicos HTTP
   */

  async get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, body, method: 'POST' });
  }

  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, body, method: 'PUT' });
  }

  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, body, method: 'PATCH' });
  }

  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Métodos de utilidad
   */

  /**
   * Verificar conectividad con el backend
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get('/actuator/health', { requiresAuth: false });
      return response.success && response.data?.status === 'UP';
    } catch {
      return false;
    }
  }

  /**
   * Obtener versión del backend
   */
  async getVersion(): Promise<ApiResponse<any>> {
    return this.get(API_ENDPOINTS.VERSION, { requiresAuth: false });
  }

  /**
   * Cambiar URL base (útil para testing)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
export default apiService;

