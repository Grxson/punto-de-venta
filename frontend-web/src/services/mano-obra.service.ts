/**
 * Servicio de API para Mano de Obra
 */

import { apiService } from './api.service';

interface ManoObra {
  id?: number;
  sucursalId?: number;
  sucursalNombre?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  puesto: string;
  salarioMensual?: number;
  pagoPorTurno?: number;
  periodo?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = '/mano-obra';

export const manoObraService = {
  /**
   * Obtener toda la mano de obra
   */
  obtenerTodas: async () => {
    try {
      const response = await apiService.get<ManoObra[]>(BASE_URL);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener mano de obra:', response.error);
      return [];
    } catch (error) {
      console.error('Exception al obtener mano de obra:', error);
      return [];
    }
  },

  /**
   * Obtener mano de obra activa
   */
  obtenerActivos: async () => {
    try {
      const response = await apiService.get<ManoObra[]>(`${BASE_URL}/activos`);
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
   * Obtener un registro de mano de obra por ID
   */
  obtenerPorId: async (id: number) => {
    try {
      const response = await apiService.get<ManoObra>(`${BASE_URL}/${id}`);
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
   * Crear un nuevo registro de mano de obra
   */
  crear: async (data: ManoObra) => {
    try {
      const response = await apiService.post<ManoObra>(BASE_URL, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al crear mano de obra');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Actualizar un registro de mano de obra
   */
  actualizar: async (id: number, data: ManoObra) => {
    try {
      const response = await apiService.put<ManoObra>(`${BASE_URL}/${id}`, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al actualizar mano de obra');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Eliminar un registro de mano de obra
   */
  eliminar: async (id: number) => {
    try {
      const response = await apiService.delete(`${BASE_URL}/${id}`);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Error al eliminar mano de obra');
    } catch (error: any) {
      throw error;
    }
  },
};
