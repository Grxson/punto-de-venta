/**
 * Servicio de API para Gastos Indirectos
 */

import { apiService } from './api.service';

interface GastoIndirecto {
  id?: number;
  sucursalId?: number;
  sucursalNombre?: string;
  nombre: string;
  descripcion?: string;
  montoMensual?: number;
  montoSemanal?: number;
  montoDiario?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = '/gastos-indirectos';

export const gastosIndirectosService = {
  /**
   * Obtener todos los gastos indirectos
   */
  obtenerTodos: async () => {
    try {
      const response = await apiService.get<GastoIndirecto[]>(BASE_URL);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener gastos indirectos:', response.error);
      return [];
    } catch (error) {
      console.error('Exception al obtener gastos indirectos:', error);
      return [];
    }
  },

  /**
   * Obtener gastos indirectos activos
   */
  obtenerActivos: async () => {
    try {
      const response = await apiService.get<GastoIndirecto[]>(`${BASE_URL}/activos`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Exception:', error);
      return [];
    }
  },

  /**
   * Obtener un gasto indirecto por ID
   */
  obtenerPorId: async (id: number) => {
    try {
      const response = await apiService.get<GastoIndirecto>(`${BASE_URL}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Exception:', error);
      return null;
    }
  },

  /**
   * Crear un nuevo gasto indirecto
   */
  crear: async (data: GastoIndirecto) => {
    try {
      const response = await apiService.post<GastoIndirecto>(BASE_URL, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al crear gasto indirecto');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Actualizar un gasto indirecto
   */
  actualizar: async (id: number, data: GastoIndirecto) => {
    try {
      const response = await apiService.put<GastoIndirecto>(`${BASE_URL}/${id}`, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al actualizar gasto indirecto');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Eliminar un gasto indirecto
   */
  eliminar: async (id: number) => {
    try {
      const response = await apiService.delete(`${BASE_URL}/${id}`);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Error al eliminar gasto indirecto');
    } catch (error: any) {
      throw error;
    }
  },
};
