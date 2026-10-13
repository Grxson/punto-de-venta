/**
 * Servicio centralizado para peticiones HTTP
 * Maneja autenticación, errores y reintentos
 *
 * Envuelve `fetch` para devolver siempre un resultado tipado
 * (`ApiResponse`) en lugar de lanzar excepciones, de modo que las pantallas
 * puedan validar `success` sin envolver cada llamada en un `try/catch`.
 */

import { API_CONFIG, DEFAULT_HEADERS, API_ENDPOINTS } from '../config/api.config';

/**
 * Opciones comunes de una petición.
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  /** Cuando es `false`, omite la cabecera `Authorization`. */
  requiresAuth?: boolean;
}

/**
 * Resultado normalizado de una petición, exitoso o no.
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Cliente HTTP basado en la configuración de `api.config.ts`.
 */
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
   * Obtener token de autenticación
   *
   * @returns El token actual, o `null` si aún no se ha implementado el
   *          almacenamiento seguro.
   */
  private getAuthToken(): string | null {
    // TODO: Implementar storage seguro (AsyncStorage, SecureStore)
    return null; // Por ahora retorna null hasta implementar auth
  }

  /**
   * Construir headers de la petición
   *
   * @param options Opciones de la petición actual.
   * @returns Las cabeceras comunes fusionadas con las de la llamada.
   */
  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers = { ...DEFAULT_HEADERS, ...options.headers };

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
   *
   * `fetch` no soporta timeout por sí solo, así que se recurre a
   * `AbortController` para poder cancelar la petición pendiente.
   *
   * @param url URL completa a la que se solicita.
   * @param options Opciones pasadas a `fetch`.
   * @param timeout Milisegundos antes de abortar.
   * @returns La respuesta cruda de `fetch`.
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
   *
   * Solo reintenta ante `AbortError` (tiempo de espera agotado): un 4xx o 5xx
   * se devuelve tal cual, porque repetirlo no cambiaría el resultado.
   *
   * @param endpoint Ruta relativa al backend.
   * @param options Opciones de la petición.
   * @param attempt Número de intento actual, usado para el retardo progresivo.
   * @returns La respuesta normalizada del intento.
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
          // TODO: Implementar refresh token o redirect a login
          console.warn('Unauthorized - Token expirado');
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
   *
   * @param ms Milisegundos a esperar.
   * @returns Promesa resuelta al cumplirse el tiempo.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Métodos públicos HTTP
   *
   * Cada verbo delega en `requestWithRetry` y solo se diferencia en el
   * método HTTP y en si admite cuerpo.
   */

  /**
   * Realiza una petición GET.
   *
   * @param endpoint Ruta relativa al backend.
   * @param options Opciones adicionales (cabeceras, timeout, autenticación).
   * @returns La respuesta normalizada.
   */
  async get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Realiza una petición POST.
   *
   * @param endpoint Ruta relativa al backend.
   * @param body Cuerpo que se serializa como JSON.
   * @param options Opciones adicionales.
   * @returns La respuesta normalizada.
   */
  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, body, method: 'POST' });
  }

  /**
   * Realiza una petición PUT.
   *
   * @param endpoint Ruta relativa al backend.
   * @param body Cuerpo que se serializa como JSON.
   * @param options Opciones adicionales.
   * @returns La respuesta normalizada.
   */
  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, body, method: 'PUT' });
  }

  /**
   * Realiza una petición PATCH.
   *
   * @param endpoint Ruta relativa al backend.
   * @param body Cuerpo que se serializa como JSON.
   * @param options Opciones adicionales.
   * @returns La respuesta normalizada.
   */
  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, body, method: 'PATCH' });
  }

  /**
   * Realiza una petición DELETE.
   *
   * @param endpoint Ruta relativa al backend.
   * @param options Opciones adicionales.
   * @returns La respuesta normalizada.
   */
  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Métodos de utilidad
   */

  /**
   * Verificar conectividad con el backend
   *
   * @returns `true` si el backend responde con estado `UP`.
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
   *
   * @returns La respuesta normalizada con la versión del backend.
   */
  async getVersion(): Promise<ApiResponse<any>> {
    return this.get(API_ENDPOINTS.VERSION, { requiresAuth: false });
  }

  /**
   * Cambiar URL base (útil para testing)
   *
   * @param url Nueva URL base del backend.
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
export default apiService;
