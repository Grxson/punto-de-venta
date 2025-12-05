/**
 * Servicio de API para Sucursales
 */

import { apiService } from './api.service';
import type { Sucursal, CrearSucursalRequest, EditarSucursalRequest } from '../types/sucursal.types';

const BASE_URL = '/sucursales';

export const sucursalesService = {
  /**
   * Obtener todas las sucursales activas
   */
  obtenerTodas: async () => {
    try {
      const response = await apiService.get<Sucursal[]>(`${BASE_URL}?activo=true`);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener sucursales:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener sucursales:', error);
      return [];
    }
  },

  /**
   * Obtener todas las sucursales incluyendo inactivas
   */
  obtenerTodosConInactivos: async () => {
    try {
      const response = await apiService.get<Sucursal[]>(BASE_URL);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener sucursales con inactivos:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener sucursales con inactivos:', error);
      return [];
    }
  },

  /**
   * Obtener una sucursal por ID
   */
  obtenerPorId: async (id: number) => {
    const response = await apiService.get<Sucursal>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crear una nueva sucursal
   */
  crear: async (data: CrearSucursalRequest) => {
    const response = await apiService.post<Sucursal>(BASE_URL, data);
    return response.data;
  },

  /**
   * Actualizar una sucursal
   */
  actualizar: async (id: number, data: EditarSucursalRequest) => {
    const response = await apiService.put<Sucursal>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Desactivar una sucursal
   */
  desactivar: async (id: number) => {
    const response = await apiService.delete<void>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Reactivar una sucursal
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Sucursal>(`${BASE_URL}/${id}/reactivar`, {});
    return response.data;
  },
};
