import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as jwtDecode from 'jwt-decode';

/**
 * Envoltorio sobre una instancia de Axios con gestión automática del token.
 *
 * Centraliza el comportamiento transversal de autenticación para que ninguna
 * pantalla tenga que añadir cabeceras manualmente: el token se adjunta en cada
 * petición y se renueva de forma transparente ante un 401.
 */
class AxiosService {
  private axiosInstance: AxiosInstance;
  /** Evita disparar varios refrescos concurrentes cuando caen varias peticiones a la vez. */
  private isRefreshing = false;
  /** Peticiones que esperan a que termine el refresco en curso. */
  private failedQueue: any[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
    });

    // Interceptor de request: inyecta el bearer token guardado tras el login.
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de response: intenta renovar el token una sola vez por
    // petición y reencola las que fallaron para reprocesarlas después.
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Si ya hay un refresco en curso, esta petición espera en la cola.
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push(() => {
                this.axiosInstance(originalRequest).then(resolve).catch(reject);
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.axiosInstance.post('/auth/refresh-token', {});
            const { token } = response.data;

            await AsyncStorage.setItem('authToken', token);

            this.failedQueue.forEach((prom) => prom());
            this.failedQueue = [];

            return this.axiosInstance(originalRequest);
          } catch (err) {
            // Si el refresco falla la sesión ya no es recuperable: se limpia
            // el almacenamiento y la UI vuelve al login en el siguiente render.
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('authUser');
            this.failedQueue = [];
            throw err;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene la instancia de Axios compartida.
   *
   * @returns La instancia configurada con los interceptores instalados.
   */
  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Guarda el token de autenticación en el almacenamiento local.
   *
   * @param token Token JWT devuelto por el backend.
   * @returns Promesa resuelta cuando el token queda persistido.
   */
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  }

  /**
   * Elimina el token guardado (cierre de sesión).
   *
   * @returns Promesa resuelta cuando el token ha sido borrado.
   */
  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  /**
   * Lee el token de autenticación guardado.
   *
   * @returns El token almacenado o `null` si no hay sesión activa.
   */
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  }

  /**
   * Comprueba si un token JWT ya expiró comparando su claim `exp`.
   *
   * @param token Token JWT a validar.
   * @returns `true` si el token expiró o es ilegible; `false` si sigue vigente.
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode.jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      // Un token que no se puede decodificar se considera inválido.
      return true;
    }
  }
}

/**
 * Instancia única compartida por toda la aplicación.
 */
export const axiosService = new AxiosService();
export const apiClient = axiosService.getAxios();
