/**
 * Servicio centralizado de peticiones HTTP.
 *
 * Concentra la autenticación, el manejo de errores y los reintentos para que
 * los demás servicios solo se preocupen por su endpoint.
 *
 * Reglas de sesión que implementa:
 * - Toda petición lleva `Authorization: Bearer <token>` salvo que se marque
 *   `requiresAuth: false` (login, refresh, health).
 * - Ante un 401 intenta UNA vez renovar el token vía `/auth/refresh-token`.
 *   Si la renovación no es posible, limpia la sesión y manda al login.
 */

import { API_CONFIG, DEFAULT_HEADERS, API_ENDPOINTS } from '../config/api.config';
import { createSingleFlight, didAuthTokenChange } from '../utils/concurrency';

/** Opciones comunes de una petición. */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Headers adicionales; se mezclan sobre `DEFAULT_HEADERS`. */
  headers?: Record<string, string>;
  /** Cuerpo; se serializa a JSON automáticamente. */
  body?: any;
  /** Timeout en ms; si se omite se usa `API_CONFIG.timeout`. */
  timeout?: number;
  /** `false` omite la cabecera `Authorization`. Por defecto la envía. */
  requiresAuth?: boolean;
}

/** Envoltura uniforme de todas las respuestas de la API. */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  /** Código HTTP; `0` cuando el fallo fue de red o la petición se canceló. */
  statusCode?: number;
}

class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  /** Colapsa varios refresh simultáneos en una sola llamada al backend. */
  private readonly refreshSingleFlight = createSingleFlight<boolean>();

  constructor() {
    this.baseUrl = API_CONFIG.apiUrl;
    this.timeout = API_CONFIG.timeout;
    this.retries = API_CONFIG.retries;
  }

  /**
   * Lee el token de autenticación.
   *
   * @returns El token, o `null` si no hay sesión o si el almacenamiento está
   *   bloqueado (p. ej. en modo privado).
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Guarda el token de autenticación.
   *
   * @param token - Token JWT emitido por el backend.
   */
  setAuthToken(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  /**
   * Elimina el token de autenticación.
   */
  clearAuthToken(): void {
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  /**
   * Auditoría 2026-09-11 (T1.2): intenta renovar el JWT expirado vía
   * /auth/refresh-token antes de dar la sesión por perdida.
   *
   * Usa single-flight para que una ráfaga de 401 solo genere un refresh.
   *
   * @returns `true` si el nuevo token quedó guardado (el caller puede
   *   reintentar la petición original); `false` si no se pudo renovar.
   */
  private tryRefreshToken(): Promise<boolean> {
    return this.refreshSingleFlight(() => this.performRefreshToken());
  }

  /**
   * Ejecuta la llamada real a `/auth/refresh-token`.
   *
   * @returns `true` solo si la respuesta trae un token nuevo y se guardó.
   */
  private async performRefreshToken(): Promise<boolean> {
    const oldToken = this.getAuthToken();
    if (!oldToken) return false;

    try {
      const url = `${this.baseUrl}${API_ENDPOINTS.REFRESH_TOKEN}`;
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${oldToken}`,
        },
      }, this.timeout);

      if (!response.ok) {
        console.warn('🔓 [API] Refresh token rechazado:', response.status);
        return false;
      }

      const data = await response.json();
      const newToken: string | undefined = data?.token;

      if (!newToken) {
        console.warn('🔓 [API] Refresh token sin token nuevo en respuesta');
        return false;
      }

      this.setAuthToken(newToken);
      return true;
    } catch (error) {
      console.error('❌ [API] Error renovando token:', error);
      return false;
    }
  }

  /**
   * Construye las cabeceras de la petición.
   *
   * @param options - Opciones de la petición.
   * @returns Cabeceras con `DEFAULT_HEADERS` y, si aplica, `Authorization`.
   */
  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = { ...DEFAULT_HEADERS, ...options.headers };

    // Agregar token si se requiere autenticación
    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Aviso, no error: un 401 posterior será el que corte la sesión.
        console.warn('⚠️ [API] requiresAuth=true pero no hay token disponible');
      }
    }

    return headers;
  }

  /**
   * Ejecuta la petición aplicando un timeout.
   *
   * @param url - URL completa.
   * @param options - Opciones de `fetch`.
   * @param timeout - Milisegundos antes de abortar.
   * @returns La respuesta cruda de `fetch`.
   * @throws Si la petición se aborta por timeout o falla la red.
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
   * Núcleo de todas las peticiones: aplica cabeceras, timeout, refresh de
   * token y reintentos, y traduce cualquier fallo a un `ApiResponse`.
   *
   * Manejo de errores:
   * - 401: intenta renovar el token una sola vez y reintenta. Si no puede,
   *   limpia la sesión y redirige a `/login?expired=true`. Los endpoints de
   *   `/auth/` cortan el ciclo: devuelven el error sin redirigir.
   * - 4xx/5xx: no reintenta, devuelve `success: false` con el mensaje del
   *   backend.
   * - AbortError: no reintenta (la cancelación fue intencional).
   * - Otros errores de red: reintenta con espera creciente hasta `retries`.
   *
   * @param endpoint - Ruta relativa ya definida en `API_ENDPOINTS`.
   * @param options - Opciones de la petición.
   * @param attempt - Intento actual; se usa como tope para el refresh del 401.
   * @returns La respuesta normalizada.
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
      } else {
      }

      const response = await this.fetchWithTimeout(url, requestOptions, timeout);

      // El backend puede responder JSON o texto plano según el endpoint.
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Verificar si fue exitosa
      if (!response.ok) {
        console.error(`❌ [${options.method}] ${url} - Status ${response.status}`, data);
        
        // Si es 401, el token expiró o es inválido
        if (response.status === 401) {
          // Auditoría 2026-09-11 (T1.2): intentar renovar sesión con refresh-token
          // antes de tirar al usuario al login. Solo una vez por request, y nunca
          // sobre las propias rutas de autenticación (evitaría un bucle).
          if (!endpoint.includes('/auth/refresh-token') &&
              !endpoint.includes('/auth/login') &&
              options.requiresAuth !== false &&
              attempt === 1) {
            // Si otra petición ya renovó el token mientras esta esperaba, el 401
            // fue por credenciales rancias: basta con reintentar con el nuevo.
            if (didAuthTokenChange(headers.Authorization, this.getAuthToken())) {
              return this.requestWithRetry<T>(endpoint, options, attempt + 1);
            }

            const refreshed = await this.tryRefreshToken();
            if (refreshed) {
              return this.requestWithRetry<T>(endpoint, options, attempt + 1);
            }
          }
          
          console.warn('🔓 [API] Sesión expirada (401), limpiando datos y redirigiendo...');
          
          // Limpiar autenticación
          this.clearAuthToken();
          localStorage.removeItem('auth_usuario');
          localStorage.removeItem('auth_sucursal');
          
          // Detener reintentos para requests de autenticación
          if (endpoint.includes('/auth/')) {
            return {
              success: false,
              error: 'Autenticación fallida',
              statusCode: response.status,
              data,
            };
          }
          
          // Para otros requests: redirigir una sola vez
          if (typeof window !== 'undefined') {
            // Verificar si ya estamos en login para evitar redirecciones recursivas
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?expired=true';
            }
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
      console.error(`❌ [${options.method || 'GET'}] ${url} - Error:`, error);
      
      // NO reintentar AbortError (solicitud cancelada intencionalmente)
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Solicitud cancelada (AbortError)',
          statusCode: 0,
        };
      }

      // Si es otro error de red y hay reintentos disponibles
      if (attempt < this.retries) {
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
   * Espera el tiempo indicado antes de reintentar.
   *
   * @param ms - Milisegundos a esperar.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Métodos públicos HTTP.
   *
   * Todos exige autenticación salvo que se pase `requiresAuth: false`, y todos
   * devuelven un `ApiResponse` en lugar de lanzar excepciones.
   */

  /**
   * Realiza una petición GET.
   *
   * @param endpoint - Ruta relativa de `API_ENDPOINTS`.
   * @param options - Headers, timeout y política de autenticación.
   * @returns La respuesta normalizada.
   */
  async get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    // Por defecto, requiresAuth es true a menos que se especifique lo contrario
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: 'GET',
      requiresAuth: options?.requiresAuth !== false ? true : false
    });
  }

  /**
   * Realiza una petición POST.
   *
   * @param endpoint - Ruta relativa de `API_ENDPOINTS`.
   * @param body - Cuerpo que se serializa a JSON.
   * @param options - Headers, timeout y política de autenticación.
   * @returns La respuesta normalizada.
   */
  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      body,
      method: 'POST',
      requiresAuth: options?.requiresAuth !== false ? true : false
    });
  }

  /**
   * Realiza una petición PUT.
   *
   * @param endpoint - Ruta relativa de `API_ENDPOINTS`.
   * @param body - Cuerpo que se serializa a JSON.
   * @param options - Headers, timeout y política de autenticación.
   * @returns La respuesta normalizada.
   */
  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      body,
      method: 'PUT',
      requiresAuth: options?.requiresAuth !== false ? true : false
    });
  }

  /**
   * Realiza una petición PATCH.
   *
   * @param endpoint - Ruta relativa de `API_ENDPOINTS`.
   * @param body - Cuerpo que se serializa a JSON.
   * @param options - Headers, timeout y política de autenticación.
   * @returns La respuesta normalizada.
   */
  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      body,
      method: 'PATCH',
      requiresAuth: options?.requiresAuth !== false ? true : false
    });
  }

  /**
   * Realiza una petición DELETE.
   *
   * @param endpoint - Ruta relativa de `API_ENDPOINTS`.
   * @param options - Headers, timeout y política de autenticación.
   * @returns La respuesta normalizada.
   */
  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: 'DELETE',
      requiresAuth: options?.requiresAuth !== false ? true : false
    });
  }

  /**
   * Métodos de utilidad.
   */

  /**
   * Comprueba que el backend responde.
   *
   * @returns `true` solo si el actuator informa `status: 'UP'`.
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
   * Obtiene la versión del backend.
   *
   * @returns La respuesta normalizada con los datos de versión.
   */
  async getVersion(): Promise<ApiResponse<any>> {
    return this.get(API_ENDPOINTS.VERSION, { requiresAuth: false });
  }

  /**
   * Cambia la URL base del servicio.
   *
   * @param url - Nueva URL base, útil en pruebas.
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Instancia única compartida por toda la aplicación
export const apiService = new ApiService();
export default apiService;

