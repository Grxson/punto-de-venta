import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as jwtDecode from 'jwt-decode';

class AxiosService {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
    });

    // Interceptor de request
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

    // Interceptor de response
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
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

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  }

  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode.jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

export const axiosService = new AxiosService();
export const apiClient = axiosService.getAxios();
